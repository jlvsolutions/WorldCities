using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorldCitiesAPI.Data.Migrations
{
    public partial class AddAdminRegions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AdminRegionId",
                table: "Cities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Capital",
                table: "Cities",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "SimpleMapsId",
                table: "Cities",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateTable(
                name: "AdminRegions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CountryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminRegions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AdminRegions_Countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cities_AdminRegionId",
                table: "Cities",
                column: "AdminRegionId");

            migrationBuilder.CreateIndex(
                name: "IX_Cities_Capital",
                table: "Cities",
                column: "Capital");

            migrationBuilder.CreateIndex(
                name: "IX_Cities_SimpleMapsId",
                table: "Cities",
                column: "SimpleMapsId");

            migrationBuilder.CreateIndex(
                name: "IX_AdminRegions_Code",
                table: "AdminRegions",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_AdminRegions_CountryId",
                table: "AdminRegions",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_AdminRegions_Name",
                table: "AdminRegions",
                column: "Name");

            migrationBuilder.AddForeignKey(
                name: "FK_Cities_AdminRegions_AdminRegionId",
                table: "Cities",
                column: "AdminRegionId",
                principalTable: "AdminRegions",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cities_AdminRegions_AdminRegionId",
                table: "Cities");

            migrationBuilder.DropTable(
                name: "AdminRegions");

            migrationBuilder.DropIndex(
                name: "IX_Cities_AdminRegionId",
                table: "Cities");

            migrationBuilder.DropIndex(
                name: "IX_Cities_Capital",
                table: "Cities");

            migrationBuilder.DropIndex(
                name: "IX_Cities_SimpleMapsId",
                table: "Cities");

            migrationBuilder.DropColumn(
                name: "AdminRegionId",
                table: "Cities");

            migrationBuilder.DropColumn(
                name: "Capital",
                table: "Cities");

            migrationBuilder.DropColumn(
                name: "SimpleMapsId",
                table: "Cities");
        }
    }
}
