using HomeBase.Application.DTOs.Lists;
using HomeBase.Application.Interfaces;
using HomeBase.Domain.Entities;
using HomeBase.Domain.Exceptions;

namespace HomeBase.Application.Services;

public class UserListService(
    IUserListRepository listRepo,
    IListItemRepository itemRepo,
    IUnitOfWork unitOfWork)
{
    // ── Lists ───────────────────────────────────────────────────────────────

    public async Task<List<UserListDto>> GetAllAsync(string userId)
    {
        var lists = await listRepo.GetAllAsync(userId);
        return lists
            .OrderBy(l => l.SortOrder)
            .Select(l => MapToDto(l))
            .ToList();
    }

    public async Task<UserListDetailDto> GetByIdAsync(string userId, Guid id)
    {
        var list = await listRepo.GetByIdAsync(id, userId)
            ?? throw new NotFoundException(nameof(UserList), id);

        var items = list.Items
            .OrderBy(i => i.SortOrder)
            .Select(i => MapItemToDto(i))
            .ToList();

        return new UserListDetailDto(
            list.Id, list.Name, list.Icon, list.SortOrder, list.CreatedAt, items);
    }

    public async Task<UserListDto> CreateAsync(string userId, CreateUserListRequest request)
    {
        var existing = await listRepo.GetAllAsync(userId);
        var list = new UserList
        {
            Name = request.Name,
            Icon = request.Icon ?? "📋",
            SortOrder = existing.Count,
            UserId = userId
        };

        await listRepo.AddAsync(list);
        await unitOfWork.SaveChangesAsync();

        return MapToDto(list);
    }

    public async Task<UserListDto> UpdateAsync(string userId, Guid id, UpdateUserListRequest request)
    {
        var list = await listRepo.GetByIdAsync(id, userId)
            ?? throw new NotFoundException(nameof(UserList), id);

        if (request.Name is not null) list.Name = request.Name;
        if (request.Icon is not null) list.Icon = request.Icon;

        listRepo.Update(list);
        await unitOfWork.SaveChangesAsync();

        return MapToDto(list);
    }

    public async Task DeleteAsync(string userId, Guid id)
    {
        var list = await listRepo.GetByIdAsync(id, userId)
            ?? throw new NotFoundException(nameof(UserList), id);

        listRepo.Delete(list);
        await unitOfWork.SaveChangesAsync();
    }

    // ── Items ───────────────────────────────────────────────────────────────

    public async Task<ListItemDto> AddItemAsync(string userId, Guid listId, CreateListItemRequest request)
    {
        var list = await listRepo.GetByIdAsync(listId, userId)
            ?? throw new NotFoundException(nameof(UserList), listId);

        var item = new ListItem
        {
            Title = request.Title,
            Url = request.Url,
            Phone = request.Phone,
            Details = request.Details,
            SortOrder = list.Items.Count,
            UserListId = list.Id
        };

        await itemRepo.AddAsync(item);
        await unitOfWork.SaveChangesAsync();

        return MapItemToDto(item);
    }

    public async Task<ListItemDto> UpdateItemAsync(string userId, Guid listId, Guid itemId, UpdateListItemRequest request)
    {
        var list = await listRepo.GetByIdAsync(listId, userId)
            ?? throw new NotFoundException(nameof(UserList), listId);

        var item = await itemRepo.GetByIdAsync(itemId, list.Id)
            ?? throw new NotFoundException(nameof(ListItem), itemId);

        if (request.Title is not null) item.Title = request.Title;
        if (request.Url is not null) item.Url = request.Url;
        if (request.Phone is not null) item.Phone = request.Phone;
        if (request.Details is not null) item.Details = request.Details;
        if (request.IsCompleted.HasValue) item.IsCompleted = request.IsCompleted.Value;
        if (request.SortOrder.HasValue) item.SortOrder = request.SortOrder.Value;

        itemRepo.Update(item);
        await unitOfWork.SaveChangesAsync();

        return MapItemToDto(item);
    }

    public async Task DeleteItemAsync(string userId, Guid listId, Guid itemId)
    {
        var list = await listRepo.GetByIdAsync(listId, userId)
            ?? throw new NotFoundException(nameof(UserList), listId);

        var item = await itemRepo.GetByIdAsync(itemId, list.Id)
            ?? throw new NotFoundException(nameof(ListItem), itemId);

        itemRepo.Delete(item);
        await unitOfWork.SaveChangesAsync();
    }

    // ── Mapping ─────────────────────────────────────────────────────────────

    private static UserListDto MapToDto(UserList list) =>
        new(list.Id, list.Name, list.Icon, list.SortOrder,
            list.Items.Count, list.Items.Count(i => i.IsCompleted), list.CreatedAt);

    private static ListItemDto MapItemToDto(ListItem item) =>
        new(item.Id, item.Title, item.Url, item.Phone, item.Details, item.IsCompleted, item.SortOrder);
}
