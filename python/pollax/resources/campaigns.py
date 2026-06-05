"""Campaigns resource"""

from typing import List, Optional, TYPE_CHECKING
from ..models import Campaign, Contact

if TYPE_CHECKING:
    from ..client import Pollax


class CampaignsResource:
    """Campaigns API resource"""

    def __init__(self, client: "Pollax"):
        self._client = client

    def create(
        self,
        name: str,
        agent_id: Optional[str] = None,
        scheduled_time: Optional[str] = None,
        contacts: Optional[List[dict]] = None,
        enable_voicemail: Optional[bool] = None,
        voicemail_message: Optional[str] = None,
        announcement_message: Optional[str] = None,
        *,
        idempotency_key: Optional[str] = None,
    ) -> Campaign:
        """Create a new campaign.

        Args:
            name: Campaign display name.
            agent_id: Agent to dispatch on every call.
            scheduled_time: Optional ISO 8601 timestamp to start the campaign.
            contacts: List of contact dicts (phone, name, metadata).
            idempotency_key: Optional ``Idempotency-Key`` header value.
                A retry with the same key and same body returns the cached
                response — protects against double-creating a campaign on
                client retry.
        """
        data = {
            "name": name,
            "agent_id": agent_id,
            "scheduled_time": scheduled_time,
            "contacts": contacts or [],
        }
        if enable_voicemail is not None:
            data["enable_voicemail"] = enable_voicemail
        if voicemail_message:
            data["voicemail_message"] = voicemail_message
        if announcement_message:
            data["announcement_message"] = announcement_message
        headers = {"Idempotency-Key": idempotency_key} if idempotency_key else None
        response = self._client.request("POST", "/api/v1/campaigns", json=data, headers=headers)
        return Campaign(**response)

    def list(self) -> List[Campaign]:
        """List all campaigns."""
        response = self._client.request("GET", "/api/v1/campaigns")
        return [Campaign(**item) for item in response]

    def retrieve(self, campaign_id: str) -> Campaign:
        """Get a single campaign by ID."""
        response = self._client.request("GET", f"/api/v1/campaigns/{campaign_id}")
        return Campaign(**response)

    def update(self, campaign_id: str, **kwargs) -> Campaign:
        """Update a campaign."""
        response = self._client.request("PUT", f"/api/v1/campaigns/{campaign_id}", json=kwargs)
        return Campaign(**response)

    def delete(self, campaign_id: str) -> dict:
        """Delete a campaign."""
        return self._client.request("DELETE", f"/api/v1/campaigns/{campaign_id}")

    def start(self, campaign_id: str) -> Campaign:
        """Start a campaign."""
        response = self._client.request("POST", f"/api/v1/campaigns/{campaign_id}/start")
        return Campaign(**response)

    def pause(self, campaign_id: str) -> Campaign:
        """Pause a running campaign."""
        response = self._client.request("POST", f"/api/v1/campaigns/{campaign_id}/pause")
        return Campaign(**response)

    def get_stats(self, campaign_id: str) -> dict:
        """Get campaign statistics."""
        return self._client.request("GET", f"/api/v1/campaigns/{campaign_id}/stats")
