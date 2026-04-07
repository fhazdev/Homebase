using HomeBase.Domain.Entities;

namespace HomeBase.Application.Interfaces;

public interface IListItemRepository
{
    Task<ListItem?> GetByIdAsync(Guid id, Guid userListId);
    Task<ListItem> AddAsync(ListItem item);
    void Update(ListItem item);
    void Delete(ListItem item);
}
