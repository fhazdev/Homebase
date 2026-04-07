namespace HomeBase.Domain.Exceptions;

public class DomainException(string message) : Exception(message);

public class NotFoundException(string entityName, object key)
    : DomainException($"{entityName} with key '{key}' was not found.");

public class ConflictException(string message) : DomainException(message);
