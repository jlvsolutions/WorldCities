using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorldCitiesAPI.Data.Migrations
{
    public partial class Migration1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Population",
                table: "Cities",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.CreateIndex(
                name: "IX_Cities_Population",
                table: "Cities",
                column: "Population");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Cities_Population",
                table: "Cities");

            migrationBuilder.DropColumn(
                name: "Population",
                table: "Cities");
        }
    }
}
