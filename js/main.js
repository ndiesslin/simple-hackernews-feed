// Get list of stories and store to variable
let stories = new getStories();
function getStories() {
  fetch('https://hacker-news.firebaseio.com/v0/newstories.json')
    .then((response) => {
      return response.json();
    })
    .then((myJson) => {
      stories = myJson;

      StoryDetails.fetch();
    })
}

// Fetch story details
let StoryDetails = (function() {
  // Initialize details object
  let storyDetails = [];
  
  // Fet story details by id
  let fetchStoryDetails = function(storyDetails, postID, storyGroup) {
    fetch(`https://hacker-news.firebaseio.com/v0/item/${postID}.json`)
      .then((response) => {
        return response.json();
      })
      .then((myJson) => {
        storyDetails.push(myJson);

        // If we reached the end of the group then append to dom
        if (storyDetails.length == storyGroup.length) {
          // Sort stories
          storyDetails = sortByTime(storyDetails);

          // append stories
          appendDetails(storyDetails);
        }
      });
  }

  let getStoryDetails = function() {
    // Clear story details
    storyDetails = [];
    let storyGroup = stories.splice(0, 20);
  
    storyGroup.forEach(async function(story) {			
      storyDetails = await fetchStoryDetails(storyDetails, story, storyGroup);
    });
  }

  // Sort object by time
  let sortByTime = function(object) {
    return object.sort((a, b) => (a.time < b.time) ? 1 : -1);
  }

  // Append story details to dom
  let appendDetails = function(storyDetails) {
    let storyHtml = '';
  
    // Loop through stories
    for(const story of storyDetails) {
      let storyDate = story.time;
      let date = new Date(0); // The 0 there is the key, which sets the date to the epoch
      date.setUTCSeconds(storyDate);

      // Create object for details template
      let detailsObject = {
        url: story.url,
        title: story.title,
        author: story.by,
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        time: date.getHours() + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes()
      }

      // Get formatted template
      storyHtml += storyDetailTemplate(detailsObject);
    }
  
    // Append stories
    document.getElementById('stories').insertAdjacentHTML( 'beforeend', storyHtml );

    // Set story appending as not pending
    appendingStory = false;
  }  

  // Return detail template
  function storyDetailTemplate(detailsObject) {
    return '<article class="story">' +
      '<a href="' + detailsObject.url + '">' +
        '<h2 class="title">' + 
        detailsObject.title +
        '</h2>' +
      '</a>' +
      '<p class="author">' + 
        detailsObject.author + 
        ' -  ' +
        detailsObject.year + '/' + detailsObject.month + '/' + detailsObject.day + ' - ' + detailsObject.time +
      '</p>' +
    '</article>';
  }

  return {
    fetch: getStoryDetails
  };
})();

// Appending story check for when we are adding story to prevent multiple calls
let appendingStory = false;

// When scrolled to bottom load more stories
window.onscroll = function(ev) {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && appendingStory === false) {
    // Set story as appending
    appendingStory = true;
    StoryDetails.fetch();
  }
};