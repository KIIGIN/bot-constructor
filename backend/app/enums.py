import enum


class BlockConnectionPoint(enum.Enum):
    START = "start"
    NEXT = "next"
    COMPLETED = "completed"


class AttachmentType(enum.Enum):
    MEDIA = "media"
    DOCUMENT = "document"


class FieldType(enum.Enum):
    TEXT = "text"
    STRING = "string"
    NUMBER = "number"
    DATE = "date"
    YES_NO = "yes_no"
    PHONE = "phone"
    EMAIL = "email"


class DurationMeasurement(enum.Enum):
    SECONDS = "seconds"
    MINUTES = "minutes"
    HOURS = "hours"
    DAYS = "days"


class DelayType(enum.Enum):
    DURATION = "duration"


class BotState(enum.Enum):
    ACTIVE = "active"
    STOPPED = "stopped"


class ScenarioState(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class ButtonType(enum.Enum):
    TO_URL = "to_url"
    TO_BLOCK = "to_block"


class KeyboardType(enum.Enum):
    INLINE_KEYBOARD = "inline_keyboard"


class HandlerType(enum.Enum):
    CALLBACK = "callback"
    MESSAGE = "message"


class TriggerType(enum.Enum):
    START = "start"
    KEY_WORD = "key_word"


class TriggerState(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class BlockType(enum.Enum):
    START = "start"
    MESSAGE = "message"
    MENU = "menu"
    INPUT_DATA = "input_data"
    DELAY = "delay"


class HTTPMethod(enum.Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"
    CONNECT = "CONNECT"
    HEAD = "HEAD"
    OPTIONS = "OPTIONS"


class AiohttpSessionMethod(enum.Enum):
    GET = "get"
    POST = "post"
    PUT = "put"
    DELETE = "delete"
    PATCH = "patch"
    CONNECT = "ws_connect"
    HEAD = "head"
    OPTIONS = "options"
