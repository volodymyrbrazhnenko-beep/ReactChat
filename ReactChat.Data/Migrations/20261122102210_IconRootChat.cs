using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReactChat.Data.Migrations
{
    /// <inheritdoc />
    public partial class IconRootChat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "Icon",
                table: "Customer",
                type: "varbinary(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RootMessageId",
                table: "ChatMessage",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessage_RootMessageId",
                table: "ChatMessage",
                column: "RootMessageId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessage_ChatMessage_RootMessageId",
                table: "ChatMessage",
                column: "RootMessageId",
                principalTable: "ChatMessage",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessage_ChatMessage_RootMessageId",
                table: "ChatMessage");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessage_RootMessageId",
                table: "ChatMessage");

            migrationBuilder.DropColumn(
                name: "Icon",
                table: "Customer");

            migrationBuilder.DropColumn(
                name: "RootMessageId",
                table: "ChatMessage");
        }
    }
}
