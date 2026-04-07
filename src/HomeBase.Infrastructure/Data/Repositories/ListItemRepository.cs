using HomeBase.Application.Interfaces;
using HomeBase.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HomeBase.Infrastructure.Data.Repositories;

public class ListItemRepository(HomeBaseDbContext db) : IListItemRepository
{
    public async Task<ListItem?> GetByIdAsync(Guid id, Guid userListId)
    {
        return await db.ListItems
            .FirstOrDefaultAsync(i => i.Id == id && i.UserListId == userListId);
    }

    public async Task<ListItem> AddAsync(ListItem item)
    {
        await db.ListItems.AddAsync(item);
        return item;
    }

    public void Update(ListItem item) => db.ListItems.Update(item);

    public void Delete(ListItem item) => db.ListItems.Remove(item);
}
