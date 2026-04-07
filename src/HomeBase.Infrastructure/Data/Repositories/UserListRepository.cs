using HomeBase.Application.Interfaces;
using HomeBase.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HomeBase.Infrastructure.Data.Repositories;

public class UserListRepository(HomeBaseDbContext db) : IUserListRepository
{
    public async Task<UserList?> GetByIdAsync(Guid id, string userId)
    {
        return await db.UserLists
            .Include(l => l.Items)
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
    }

    public async Task<List<UserList>> GetAllAsync(string userId)
    {
        return await db.UserLists
            .Include(l => l.Items)
            .Where(l => l.UserId == userId)
            .OrderBy(l => l.SortOrder)
            .ToListAsync();
    }

    public async Task<UserList> AddAsync(UserList list)
    {
        await db.UserLists.AddAsync(list);
        return list;
    }

    public void Update(UserList list) => db.UserLists.Update(list);

    public void Delete(UserList list) => db.UserLists.Remove(list);
}
