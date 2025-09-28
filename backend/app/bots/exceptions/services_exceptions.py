class BotNotFoundError(Exception):
    pass


class NoPermissionForBotError(Exception):
    pass


class BotAlreadyUsedError(Exception):
    pass


class InvalidTelegramTokenError(Exception):
    pass


class BotAlreadyRunningError(Exception):
    pass


class BotNotRunningError(Exception):
    pass
