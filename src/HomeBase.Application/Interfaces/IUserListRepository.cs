using HomeBase.Domain.Entities;

namespace HomeBase.Application.Interfaces;

public interface IUserListRepository
{
    Task<UserList?> GetByIdAsync(Guid id, string userId);
    Task<List<UserList>> GetAllAsync(string userId);
    Task<UserList> AddAsync(UserList list);
    void Update(UserList list);
    void Delete(UserList list);
}
