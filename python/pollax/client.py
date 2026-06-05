"""Pollax API client"""

from typing import Optional, Union
import hmac
import hashlib
import time
import httpx

from .resources.agents import AgentsResource
from .resources.calls import CallsResource
from .resources.campaigns import CampaignsResource
from .resources.knowledge import KnowledgeResource
from .resources.analytics import AnalyticsResource
from .resources.integrations import IntegrationsResource
from .resources.phone_numbers import PhoneNumbersResource
from .resources.api_keys import ApiKeysResource
from .resources.voice_cloning import VoiceCloningResource
from .resources.webhooks import WebhooksResource
from .errors import PollaxError, AuthenticationError, NotFoundError, RateLimitError


class Pollax:
    """
    Pollax API client.
    
    Example:
        >>> from pollax import Pollax
        >>> client = Pollax(api_key="sk_live_...")
        >>> agent = client.agents.create(
        ...     name="Support Agent",
        ...     system_prompt="You are helpful",
        ... )
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.pollax.ai",
        timeout: float = 30.0,
        max_retries: int = 3,
        tenant_id: Optional[str] = None,
    ):
        """
        Initialize Pollax client.
        
        Args:
            api_key: Your Pollax API key (required)
            base_url: Base URL for the API
            timeout: Request timeout in seconds
            max_retries: Maximum number of retry attempts
            tenant_id: Organization/tenant ID (optional)
        
        Raises:
            ValueError: If api_key is not provided
        """
        if not api_key:
            raise ValueError("API key is required. Get one at https://pollax.ai/settings/api-keys")

        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.max_retries = max_retries

        # Populated after every request — Stripe-style `last_response` info.
        # None until the first request completes; otherwise a dict with
        # {limit, remaining, reset} as ints (or None per missing header).
        self.last_rate_limit: Optional[dict] = None

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "Pollax-SDK-Python/1.1.0",
        }

        if tenant_id:
            headers["X-Tenant-ID"] = tenant_id

        self.client = httpx.Client(
            base_url=self.base_url,
            headers=headers,
            timeout=timeout,
        )

        # Initialize resources
        self.agents = AgentsResource(self)
        self.calls = CallsResource(self)
        self.campaigns = CampaignsResource(self)
        self.knowledge = KnowledgeResource(self)
        self.analytics = AnalyticsResource(self)
        self.integrations = IntegrationsResource(self)
        self.phone_numbers = PhoneNumbersResource(self)
        self.api_keys = ApiKeysResource(self)
        self.voice_cloning = VoiceCloningResource(self)
        self.webhooks = WebhooksResource(self)

    def request(
        self,
        method: str,
        path: str,
        *,
        json: Optional[dict] = None,
        params: Optional[dict] = None,
        files: Optional[dict] = None,
        headers: Optional[dict] = None,
        _retries: int = 0,
    ) -> dict:
        """
        Make an HTTP request with automatic retries.

        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            path: API endpoint path
            json: JSON request body
            params: Query parameters
            files: Files to upload
            headers: Extra per-request headers (merged over client defaults).
                     Used to pass Idempotency-Key on mutating requests.
            _retries: Internal retry counter

        Returns:
            Response data as dictionary

        Raises:
            PollaxError: On API errors
            AuthenticationError: On authentication failures
            NotFoundError: When resource not found
            RateLimitError: When rate limit exceeded
        """
        try:
            if files:
                # Remove Content-Type for multipart/form-data
                base_headers = {k: v for k, v in self.client.headers.items() if k != "Content-Type"}
                if headers:
                    base_headers.update(headers)
                response = self.client.request(
                    method,
                    path,
                    params=params,
                    files=files,
                    headers=base_headers,
                )
            else:
                response = self.client.request(
                    method,
                    path,
                    json=json,
                    params=params,
                    headers=headers,
                )

            # Capture rate-limit info from every successful response so callers
            # can inspect it via client.last_rate_limit (Stripe-style pattern).
            self._capture_rate_limit(response)

            response.raise_for_status()

            # Handle empty responses
            if not response.content:
                return {}

            return response.json()

        except httpx.HTTPStatusError as e:
            status_code = e.response.status_code

            # Capture rate-limit info even on errors so 429 handlers can see it.
            self._capture_rate_limit(e.response)

            # Handle rate limiting with exponential backoff
            if status_code == 429 and _retries < self.max_retries:
                retry_after = int(e.response.headers.get("Retry-After", "1"))
                time.sleep(retry_after)
                return self.request(method, path, json=json, params=params, files=files, headers=headers, _retries=_retries + 1)

            # Parse error message
            try:
                error_data = e.response.json()
                message = error_data.get("error") or error_data.get("detail", str(e))
            except Exception:
                message = str(e)

            # Raise appropriate error type
            if status_code == 401:
                raise AuthenticationError(message)
            elif status_code == 404:
                raise NotFoundError(message)
            elif status_code == 429:
                raise RateLimitError(message)
            else:
                raise PollaxError(message, status_code=status_code)

        except httpx.RequestError as e:
            # Retry on network errors
            if _retries < self.max_retries:
                delay = 2 ** _retries  # Exponential backoff
                time.sleep(delay)
                return self.request(method, path, json=json, params=params, files=files, headers=headers, _retries=_retries + 1)

            raise PollaxError(f"Network error: {str(e)}")

    def _capture_rate_limit(self, response) -> None:
        """Store rate-limit headers from the last response, if present.

        Accepts both Stripe/Twilio-style `X-RateLimit-*` headers and the
        RFC 6585 `RateLimit-*` aliases that the Pollax backend emits.
        """
        h = response.headers
        limit = h.get("x-ratelimit-limit") or h.get("ratelimit-limit")
        remaining = h.get("x-ratelimit-remaining") or h.get("ratelimit-remaining")
        reset = h.get("x-ratelimit-reset") or h.get("ratelimit-reset")
        if limit is None and remaining is None and reset is None:
            self.last_rate_limit = None
            return

        def _to_int(v):
            try:
                return int(v) if v is not None else None
            except (TypeError, ValueError):
                return None

        self.last_rate_limit = {
            "limit": _to_int(limit),
            "remaining": _to_int(remaining),
            "reset": _to_int(reset),
        }

    def close(self) -> None:
        """Close the HTTP client."""
        self.client.close()

    def __enter__(self) -> "Pollax":
        """Context manager entry."""
        return self

    def __exit__(self, *args) -> None:
        """Context manager exit."""
        self.close()

    @staticmethod
    def verify_webhook_signature(
        raw_body: Union[str, bytes],
        signature_header: Optional[str],
        secret: str,
        tolerance_seconds: int = 300,
    ) -> bool:
        """Verify the signature on an incoming webhook from Pollax.

        Pollax POSTs every event with a ``Pollax-Signature`` header of the form
        ``t=<unix_seconds>,v1=<hmac_sha256(t.body)>``. Call this from your
        webhook handler **before** parsing/trusting the payload. Use the **raw**
        request body (bytes or str), not the parsed JSON.

        Args:
            raw_body: The exact body bytes (or string) received in the request.
            signature_header: The value of the ``Pollax-Signature`` header.
            secret: The signing secret returned when the webhook subscription
                was created (or rotated).
            tolerance_seconds: Maximum age of the timestamp to accept.
                Defaults to 300 (5 minutes) — protects against replay attacks.

        Returns:
            ``True`` on success.

        Raises:
            PollaxError: If the header is missing/malformed, the signature
                does not match, or the timestamp is outside tolerance.

        Example:
            >>> # Flask handler:
            >>> @app.post("/pollax-events")
            ... def pollax_webhook():
            ...     Pollax.verify_webhook_signature(
            ...         request.data,
            ...         request.headers.get("Pollax-Signature"),
            ...         os.environ["POLLAX_WEBHOOK_SECRET"],
            ...     )
            ...     event = request.get_json()
            ...     # ...process trusted event
            ...     return "", 200
        """
        if not signature_header:
            raise PollaxError("Missing Pollax-Signature header", status_code=400)
        if not secret:
            raise PollaxError("Webhook signing secret is empty", status_code=500)

        # Parse `t=<unix>,v1=<hex>` (tolerates additional v* schemes).
        parts: dict = {}
        for segment in signature_header.split(","):
            if "=" in segment:
                k, v = segment.split("=", 1)
                parts[k.strip()] = v.strip()
        timestamp = parts.get("t")
        v1 = parts.get("v1")
        if not timestamp or not v1:
            raise PollaxError("Malformed Pollax-Signature header", status_code=400)

        body_bytes = raw_body.encode("utf-8") if isinstance(raw_body, str) else raw_body
        signed = f"{timestamp}.".encode("utf-8") + body_bytes
        expected = hmac.new(secret.encode("utf-8"), signed, hashlib.sha256).hexdigest()

        if not hmac.compare_digest(expected, v1):
            raise PollaxError("Webhook signature does not match", status_code=401)

        try:
            ts = int(timestamp)
        except (TypeError, ValueError):
            raise PollaxError("Webhook signature timestamp is not numeric", status_code=400)

        age = abs(int(time.time()) - ts)
        if age > tolerance_seconds:
            raise PollaxError(
                f"Webhook signature timestamp outside tolerance ({age}s > {tolerance_seconds}s)",
                status_code=401,
            )

        return True
