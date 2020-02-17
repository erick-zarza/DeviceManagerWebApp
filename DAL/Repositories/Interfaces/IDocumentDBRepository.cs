using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.Azure.Documents;

namespace DAL.Repositories.Interfaces
{
    public interface IDocumentDBRepository<T> where T : class
    {
        Task<Document> CreateItemAsync(T item);
        Task DeleteItemAsync(string id);
        Task<T> GetItemAsync(string id);
        Task<IEnumerable<T>> GetItemsAsync();
        Task<Document> UpdateItemAsync(string id, T item);
    }
}
