from fastapi import HTTPException, status


class FailedToSetWebhookHTTPException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to set webhook with Telegram",
        )


class FailedToDeleteWebhookHTTPException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to delete webhook with Telegram",
        )
