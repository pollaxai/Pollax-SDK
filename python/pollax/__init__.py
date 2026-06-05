"""
Pollax Python SDK

Official Python client library for the Pollax AI Voice Platform.
"""

__version__ = "1.1.0"

from .client import Pollax
from .errors import (
    PollaxError,
    AuthenticationError,
    NotFoundError,
    RateLimitError,
    ValidationError,
)
from .models import (
    Agent,
    Call,
    CallStatus,
    Campaign,
    KnowledgeDocument,
    Integration,
    PhoneNumber,
    ApiKey,
    VoiceProfile,
)

__all__ = [
    "Pollax",
    "PollaxError",
    "AuthenticationError",
    "NotFoundError",
    "RateLimitError",
    "ValidationError",
    "Agent",
    "Call",
    "CallStatus",
    "Campaign",
    "KnowledgeDocument",
    "Integration",
    "PhoneNumber",
    "ApiKey",
    "VoiceProfile",
]
