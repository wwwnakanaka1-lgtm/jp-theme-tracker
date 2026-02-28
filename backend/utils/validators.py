"""Input validation helpers for request parameters.

Provides reusable validation functions that supplement
the security module with domain-specific checks for
the JP Theme Tracker application.
"""

import re
from typing import Optional

# Valid sort fields for theme listings
VALID_SORT_FIELDS = frozenset([
    "change_percent", "name", "stock_count", "market_cap",
])

# Valid export formats
VALID_EXPORT_FORMATS = frozenset(["csv", "json"])

# Email pattern for basic validation
EMAIL_PATTERN = re.compile(
    r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
)

# Username constraints
USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_-]{3,32}$")


def validate_sort_field(field: str) -> str:
    """Validate and return a sort field name.

    Args:
        field: Requested sort field.

    Returns:
        Validated sort field string.

    Raises:
        ValueError: If the field is not in the allowed set.
    """
    if field not in VALID_SORT_FIELDS:
        raise ValueError(
            f"Invalid sort field: {field}. "
            f"Allowed: {', '.join(sorted(VALID_SORT_FIELDS))}"
        )
    return field


def validate_export_format(fmt: str) -> str:
    """Validate the requested export format.

    Args:
        fmt: Format string (csv or json).

    Returns:
        Validated format string.

    Raises:
        ValueError: If the format is not supported.
    """
    fmt_lower = fmt.lower().strip()
    if fmt_lower not in VALID_EXPORT_FORMATS:
        raise ValueError(
            f"Invalid export format: {fmt}. "
            f"Allowed: {', '.join(sorted(VALID_EXPORT_FORMATS))}"
        )
    return fmt_lower


def validate_email(email: str) -> str:
    """Check that the email address is well-formed.

    Args:
        email: Email string to validate.

    Returns:
        The email string if valid.

    Raises:
        ValueError: If the email does not match the pattern.
    """
    if not EMAIL_PATTERN.match(email):
        raise ValueError(f"Invalid email address: {email}")
    return email


def validate_username(username: str) -> str:
    """Validate a username against character and length rules.

    Args:
        username: Username to validate.

    Returns:
        The username if valid.

    Raises:
        ValueError: If username is invalid.
    """
    if not USERNAME_PATTERN.match(username):
        raise ValueError(
            f"Invalid username: {username}. "
            "Must be 3-32 chars, alphanumeric/hyphen/underscore."
        )
    return username


def validate_limit(
    limit: int,
    min_val: int = 1,
    max_val: int = 100,
) -> int:
    """Validate a pagination limit parameter.

    Args:
        limit: Requested limit value.
        min_val: Minimum allowed value.
        max_val: Maximum allowed value.

    Returns:
        Clamped limit value within bounds.
    """
    return max(min_val, min(limit, max_val))


def sanitize_search_query(query: Optional[str]) -> Optional[str]:
    """Clean up a search query string.

    Strips whitespace and removes potentially dangerous
    characters while preserving Japanese text.

    Args:
        query: Raw search query.

    Returns:
        Sanitized query or None if empty.
    """
    if not query:
        return None
    cleaned = query.strip()
    cleaned = re.sub(r"[<>\"';]", "", cleaned)
    return cleaned if cleaned else None
