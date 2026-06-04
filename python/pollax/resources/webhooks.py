"""Webhooks resource — manage outgoing webhook subscriptions."""

from typing import List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from ..client import Pollax


class WebhooksResource:
    """Tenant webhook subscriptions.

    A subscription tells Pollax where to POST events (call.completed,
    campaign.finished, etc.). Verify incoming events with
    :py:meth:`pollax.Pollax.verify_webhook_signature`.
    """

    def __init__(self, client: "Pollax"):
        self._client = client

    def create(
        self,
        url: str,
        events: Optional[List[str]] = None,
        description: Optional[str] = None,
    ) -> dict:
        """Create a webhook subscription.

        Args:
            url: HTTPS endpoint that will receive POSTs from Pollax.
            events: Event types to subscribe to, e.g.
                ``['call.completed', 'call.failed']``. Use ``['*']`` or omit
                to subscribe to all events.
            description: Free-form label shown in the dashboard.

        Returns:
            A dict including ``id``, ``url``, ``events``, ``is_active``, and
            ``signing_secret``. **The signing secret is returned exactly once
            — store it immediately.** Use it to verify inbound webhooks.

        Example:
            >>> sub = client.webhooks.create(
            ...     url="https://my-server.com/pollax-events",
            ...     events=["call.completed", "call.failed"],
            ...     description="Production events",
            ... )
            >>> print("Secret (save this):", sub["signing_secret"])
        """
        body = {"url": url}
        if events is not None:
            body["events"] = events
        if description is not None:
            body["description"] = description
        return self._client.request("POST", "/api/v1/webhooks", json=body)

    def list(self) -> dict:
        """List webhook subscriptions for the current tenant.

        Returns:
            ``{"data": [...], "has_more": bool}``
        """
        return self._client.request("GET", "/api/v1/webhooks")

    def retrieve(self, subscription_id: str) -> dict:
        """Fetch a single subscription by ID."""
        return self._client.request("GET", f"/api/v1/webhooks/{subscription_id}")

    def update(
        self,
        subscription_id: str,
        *,
        url: Optional[str] = None,
        events: Optional[List[str]] = None,
        description: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> dict:
        """Update a subscription.

        Re-enabling a disabled webhook (``is_active=True``) clears
        ``disabled_at`` and resets the failure counter.
        """
        body = {}
        if url is not None:
            body["url"] = url
        if events is not None:
            body["events"] = events
        if description is not None:
            body["description"] = description
        if is_active is not None:
            body["is_active"] = is_active
        return self._client.request("PUT", f"/api/v1/webhooks/{subscription_id}", json=body)

    def delete(self, subscription_id: str) -> None:
        """Delete a subscription."""
        self._client.request("DELETE", f"/api/v1/webhooks/{subscription_id}")

    def rotate_secret(self, subscription_id: str) -> dict:
        """Rotate the signing secret.

        The old secret stops verifying immediately — coordinate the swap on
        your server. Returns the new secret exactly once.
        """
        return self._client.request("POST", f"/api/v1/webhooks/{subscription_id}/rotate-secret")

    def list_deliveries(self, subscription_id: str, limit: int = 50) -> dict:
        """List recent delivery attempts for a subscription.

        Useful for debugging an integration that isn't receiving events.
        """
        return self._client.request(
            "GET",
            f"/api/v1/webhooks/{subscription_id}/deliveries",
            params={"limit": limit},
        )
