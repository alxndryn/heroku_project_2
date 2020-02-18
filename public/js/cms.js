$(document).ready(function() {
    // Getting jQuery references to the user body, title, form, and group select
    
    var usernameInput = $("#title");
    var cmsForm = $("#cms");
    var groupSelect = $("#group");
    // Adding an event listener for when the form is submitted
    $(cmsForm).on("submit", handleFormSubmit);
    // Gets the part of the url that comes after the "?" (which we have if we're updating a user)
    var url = window.location.search;
    var userId;
    var groupId;
    // Sets a flag for whether or not we're updating a user to be false initially
    var updating = false;
  
    // If we have this section in our url, we pull out the user id from the url
    // In '?user_id=1', userId is 1
    if (url.indexOf("?user_id=") !== -1) {
      userId = url.split("=")[1];
      getUserData(userId, "user");
    }
    // Otherwise if we have an group_id in our url, preset the group select box to be our Group
    else if (url.indexOf("?group_id=") !== -1) {
      groupId = url.split("=")[1];
    }
  
    // Getting the groups, and their users
    getGroups();
  
    // A function for handling what happens when the form to create a new user is submitted
    function handleFormSubmit(event) {
      event.preventDefault();
      // Wont submit the user if we are missing a username or group
      if (!usernameInput.val().trim() || !groupSelect.val()) {
        return;
      }
      // Constructing a newUser object to hand to the database
      var newUser = {
        username: usernameInput
          .val()
          .trim(),
        GroupId: groupSelect.val()
      };
  
      // If we're updating a user run updateUser to update a user
      // Otherwise run submituser to create a whole new user
      if (updating) {
        newUser.id = userId;
        updateUser(newUser);
      }
      else {
        submitUser(newUser);
      }
    }
  
    // Submits a new user and brings user to blog page upon completion
    function submitUser(user) {
      $.post("/api/users", user, function() {
        window.location.href = "/concerts";
      });
    }
  
    // Gets user data for the current user if we're editing, or if we're adding to an group's existing users
    function getUserData(id, type) {
      var queryUrl;
      switch (type) {
      case "user":
        queryUrl = "/api/users/" + id;
        break;
      case "group":
        queryUrl = "/api/groups/" + id;
        break;
      default:
        return;
      }
      $.get(queryUrl, function(data) {
        if (data) {
          console.log(data.GroupId || data.id);
          // If this user exists, prefill our cms forms with its data
          usernameInput.val(data.username);
          
          groupId = data.GroupId || data.id;
          // If we have a user with this id, set a flag for us to know to update the user
          // when we hit submit
          updating = true;
        }
      });
    }
  
    // A function to get Groups and then render our list of Groups
    function getGroups() {
      $.get("/api/groups", renderGroupList);
    }
    // Function to either render a list of groups, or if there are none, direct the user to the page
    // to create an group first
    function renderGroupList(data) {
      if (!data.length) {
        window.location.href = "/concerts";
        console.log(data);
      }
      $(".hidden").removeClass("hidden");
      var rowsToAdd = [];
      for (var i = 0; i < data.length; i++) {
        rowsToAdd.push(createGroupRow(data[i]));
      }
      groupSelect.empty();
      console.log(rowsToAdd);
      console.log(groupSelect);
      groupSelect.append(rowsToAdd);
      groupSelect.val(groupId);
    }
  
    // Creates the group options in the dropdown
    function createGroupRow(group) {
      var listOption = $("<option>");
      listOption.attr("value", group.id);
      listOption.text(group.name);
      return listOption;
    }
  
    // Update a given user, bring user to the blog page when done
    function updateUser(user) {
      $.ajax({
        method: "PUT",
        url: "/api/users",
        data: user
      })
        .then(function() {
          window.location.href = "/concerts";
        });
    }
  });