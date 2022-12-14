using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace WorldCitiesAPI.Data.Entities
{
    [Index(nameof(OwnerId))]
    [Index(nameof(GroupId))]
    public class RecordAccess
    {
        /// <summary>
        /// Owning user
        /// </summary>
        [ForeignKey(nameof(ApplicationUser))]
        public string OwnerId { get; set; } = null!;

        /// <summary>
        /// Group membership
        /// </summary>
        public string GroupId { get; set; } = null!;

        /// <summary>
        /// User/Group/Other permissions: rwxrwxrwx
        /// </summary>
        public string Permissions { get; set; } = "rwx------";
    }
}
