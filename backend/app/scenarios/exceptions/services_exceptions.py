class NoPermissionForScenarioError(Exception):
    pass


class ScenarioNotFoundError(Exception):
    pass


class EmptyFileError(Exception):
    pass


class ScenarioTriggersDisabledError(Exception):
    pass


class ScenarioAlreadyRunningError(Exception):
    pass


class ScenarioNotRunningError(Exception):
    pass


class FileTooLargeError(Exception):
    pass
