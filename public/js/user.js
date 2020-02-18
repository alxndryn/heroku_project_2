$(document).ready(function() {
    /* global moment */
  
    // blogContainer holds all of our users
    var blogContainer = $(".blog-container");
    var userCategorySelect = $("#category");
    // Click events for the edit and delete buttons
    $(document).on("click", "button.delete", handleUserDelete);
    $(document).on("click", "button.edit", handleUserEdit);
    // Variable to hold our users
    var users;
  
    // The code below handles the case where we want to get blog users for a specific group
    // Looks for a query param in the url for group_id
    var url = window.location.search;
    var groupId;
    if (url.indexOf("?group_id=") !== -1) {
      groupId = url.split("=")[1];
      getUsers(groupId);
    }
    // If there's no groupId we just get all users as usual
    else {
      getUsers();
    }
  
  
    // This function grabs users from the database and updates the view
    function getUsers(group) {
      groupId = group || "";
      if (groupId) {
        groupId = "/?group_id=" + groupId;
      }
      $.get("/api/users" + groupId, function(data) {
        console.log("Users", data);
        users = data;
        if (!users || !users.length) {
          displayEmpty(group);
        }
        else {
          initializeRows();
        }
      });
    }
  
    // This function does an API call to delete users
    function deleteUser(id) {
      $.ajax({
        method: "DELETE",
        url: "/api/users/" + id
      })
        .then(function() {
          getUsers(userCategorySelect.val());
        });
    }
  
    // InitializeRows handles appending all of our constructed user HTML inside blogContainer
    function initializeRows() {
      blogContainer.empty();
      var usersToAdd = [];
      for (var i = 0; i < users.length; i++) {
        usersToAdd.push(createNewRow(users[i]));
      }
      blogContainer.append(usersToAdd);
    }
  
    // This function constructs a user's HTML
    function createNewRow(user) {
      var formattedDate = new Date(user.createdAt);
      formattedDate = moment(formattedDate).format("MMMM Do YYYY, h:mm:ss a");
      var newUserCard = $("<div>");
      newUserCard.addClass("card");
      var newUserCardHeading = $("<div>");
      newUserCardHeading.addClass("card-header");
      var deleteBtn = $("<button>");
      deleteBtn.text("x");
      deleteBtn.addClass("delete btn btn-danger");
      var editBtn = $("<button>");
      editBtn.text("EDIT");
      editBtn.addClass("edit btn btn-info");
      var newUserTitle = $("<h2>");
      var newUserDate = $("<small>");
      var newUserGroup = $("<h5>");
      newUserGroup.text("Written by: " + user.Group.name);
      newUserGroup.css({
        float: "right",
        color: "blue",
        "margin-top":
        "-10px"
      });
      var newUserCardBody = $("<div>");
      newUserCardBody.addClass("card-body");
      var newUserBody = $("<p>");
      newUserTitle.text(user.title + " ");
      newUserBody.text(user.body);
      newUserDate.text(formattedDate);
      newUserTitle.append(newUserDate);
      newUserCardHeading.append(deleteBtn);
      newUserCardHeading.append(editBtn);
      newUserCardHeading.append(newUserTitle);
      newUserCardHeading.append(newUserGroup);
      newUserCardBody.append(newUserBody);
      newUserCard.append(newUserCardHeading);
      newUserCard.append(newUserCardBody);
      newUserCard.data("user", user);
      return newUserCard;
    }
  
    // This function figures out which user we want to delete and then calls deleteUser
    function handleUserDelete() {
      var currentUser = $(this)
        .parent()
        .parent()
        .data("user");
      deleteUser(currentUser.id);
    }
  
    // This function figures out which user we want to edit and takes it to the appropriate url
    function handleUserEdit() {
      var currentUser = $(this)
        .parent()
        .parent()
        .data("user");
      window.location.href = "/cms?user_id=" + currentUser.id;
    }
  
    // This function displays a message when there are no users
    function displayEmpty(id) {
      var query = window.location.search;
      var partial = "";
      if (id) {
        partial = " for Group #" + id;
      }
      blogContainer.empty();
      var messageH2 = $("<h2>");
      messageH2.css({ "text-align": "center", "margin-top": "50px" });
      messageH2.html("No users yet" + partial + ", navigate <a href='/cms" + query +
      "'>here</a> in order to get started.");
      blogContainer.append(messageH2);
    }
  
  });
  