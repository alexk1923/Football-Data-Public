/* jshint esversion: 8 */

let countries;
const teams = [];
let teamFavoriteId = - 1;
let teamName;

// --------------- Local Storage --------------- //

// Get favorite team ID from local storage on page load
$(document).ready(() => {
  teamFavoriteId = localStorage.getItem("FootballData-FavTeamID");
  if(teamFavoriteId == null) {
    teamFavoriteId = -1;
    alert("NO FAVORITE TEAM SET");
  } else{
    fetchFavTeam(teamFavoriteId);
  }
});


// --------------- API Requests --------------- //

// Your API Keys

// https://www.api-football.com/
const newsAPIKey = "";

// https://newsapi.org/
const footballAPIKey = "";

// API Request for favorite team data
async function fetchFavTeam(teamFavoriteId)
{
  let myHeaders = new Headers();
  myHeaders.append("x-rapidapi-key", footballAPIKey);
  myHeaders.append("x-rapidapi-host", "v3.football.api-sports.io");

  let requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  let url = "https://v3.football.api-sports.io/teams";
  url += `?id=${teamFavoriteId}`;
  const response = await fetch(url, requestOptions);
  
  if(!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const data = await response.json();
  console.log(data);

  if(data.response.length > 0) {
    changeFavTeamInfo(data.response[0].team);
    fetchFixtures(teamFavoriteId);
  }
}

// Update favorite team DOM after getting data from API
function changeFavTeamInfo(team) {
  const currFavTeam = $(".fav-team");
  currFavTeam.text(team.name);
  $(".fav-team").prepend(`<img src="${team.logo}" class="fav-team-logo" alt="favorite team logo" />`);
  teamName = team.name;
  fetchNews(teamName);
}

// API Request for teams from selected country and user input
async function fetchTeams(countryName) {
  let myHeaders = new Headers();
  myHeaders.append("x-rapidapi-key", footballAPIKey);
  myHeaders.append("x-rapidapi-host", "v3.football.api-sports.io");

  let requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  let url;
  if(countryName != "none") {
    url = `https://v3.football.api-sports.io/teams?country=${countryName}`;
  } else {
    alert("Please select a country first!");
    return;
  }

  // fetch all teams first
  const response = await fetch(url, requestOptions);
  
  if(!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const data = await response.json();
  console.log(data);
  
  if(teams.length > 0) {
    teams.splice(0, teams.length);
  }

  teams.push(...data.response);
}


// API Request for latest match played
async function fetchFixtures(teamFavoriteId)
{
  let myHeaders = new Headers();
  myHeaders.append("x-rapidapi-key", footballAPIKey);
  myHeaders.append("x-rapidapi-host", "v3.football.api-sports.io");

  let requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  const season = new Date().getFullYear();

  let url = "https://v3.football.api-sports.io/fixtures";
  url += `?team=${teamFavoriteId}`;
  url += `&season=${season}`;
  const response = await fetch(url, requestOptions);
  
  if(!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const data = await response.json();
  if(data.response.length == 0) {
    return;
  }
  const fixtures = data.response;
  fixtures.sort((a, b) => new Date(Date.parse(a.fixture.date)) - new Date(Date.parse(b.fixture.date)));

  const lastMatch = fixtures.findLast((e) => e.fixture.status.short == "FT");

  const currFixtures = $(".match.main-match img");
  currFixtures[0].src = lastMatch.teams.home.logo;
  currFixtures[1].src = lastMatch.teams.away.logo;
  $(".team-name.home-team").text(lastMatch.teams.home.name);
  $(".team-name.away-team").text(lastMatch.teams.away.name);
  $("span.score").text(lastMatch.score.fulltime.home + "-" + lastMatch.score.fulltime.away);
  
  $(".text-info").text(lastMatch.league.name);
  $(".league img").attr("src", lastMatch.league.logo);
  $(".stadium-info").text(lastMatch.fixture.venue != null ? lastMatch.fixture.venue.name : "Unknown Stadium");

  console.log(lastMatch.fixture.date.toString());
  $(".date-info").text(lastMatch.fixture.date.substring(0, 10));
  $(".stadium-date img").attr("src", lastMatch.league.logo);  
}

// API Request for countries
$(document).ready(async function () {
  const select = $("select.select-country");

  let myHeaders = new Headers();
  myHeaders.append("x-rapidapi-key", footballAPIKey);
  myHeaders.append("x-rapidapi-host", "v3.football.api-sports.io");

  let requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  let url = "https://v3.football.api-sports.io/countries";
  const response = await fetch(url, requestOptions);
  
  if(!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const data = await response.json();

  $.each(data.response, (index, country) => {
    select.append(`<option>${country.name}</option>`);
  });

  countries = data;
});

// API Request - get news depending on team ID
async function fetchNews(teamName) {
  let myHeaders = new Headers();
  myHeaders.append("X-Api-Key", newsAPIKey);

  let requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };

  let url = "https://newsapi.org/v2/top-headlines";
  url += `?country=ro&category=sports`;

  let teamNameArr = teamName.split(" ");
  for(let teamSubName of teamNameArr) {
    if(teamSubName.length >= 3) {
      url +=`&q=${teamSubName.toLowerCase()}`;
    }
  }

  const response = await fetch(url, requestOptions);
  
  if(!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const data = await response.json();

  // update DOM
  const newsContent = data.articles.map((article) => {
    return `
    <figure class="team">
      <a href="${article.url}">
      <img src="${article.urlToImage}"/ alt="article-photo">
      <figcaption class="news-title">${article.title}</figcaption>
      <p class="news-author">${article.source.name}</p>
      </a> 
    </figure>
    `;
  });

  $(".news-container").append(newsContent);
  await newsIntersection();
}

// --------------- Navigation --------------- //

// Nav menu for mobile
$(".toggle-icon").click(function () { 
  $(".links").toggleClass("active");
});

// Sticky navbar on scroll
$(document).scroll(function () { 
  $("nav").toggleClass("sticky", window.scrollY > 0);
});

// Dynamic navigation on scroll
async function newsIntersection() {
  const faders = document.querySelectorAll(".fade-in");

  const intersectionOptions = {
    threshold: 0.7,
  };
  
  const itemsObserver = new IntersectionObserver(function (entries, itemsObserver) {
    entries.forEach(entry => {
      if(!entry.isIntersecting) {
        return;
      } else {
        entry.target.classList.add("appear");
        itemsObserver.unobserve(entry.target);
      }
    });
  }, intersectionOptions);
  
  
  faders.forEach((fader) => {
    itemsObserver.observe(fader);
  });
}


// Section smooth scrolling
$('.links a[href^="#"]').click(function (event) {
  event.preventDefault();
  const section =  document.querySelector(event.target.getAttribute("href"));
  section.scrollIntoView({
    behavior: "smooth"
  });
});

// Underline effect on menu links
$(".links a").click((event) => {
  event.preventDefault();
  $(".links a.selected").removeClass("selected");
  (event.target).classList.toggle("selected");
});


// --------------- Team Search --------------- //

// Dynamic text + typing effect
$(document).ready(function () {
  const stringArr = ["Choose a country",
                      "Search your team to get data"];

  let i = 0;
  let j = 0;
  let speed = 50;
  let completeWord = false;

  const text = $(".pick-fav h2");
  setInterval(() => {
      text.toggleClass("transparent-cursor");
  }, 500);


  function typeWriter() {
    $(".pick-fav h2").text(stringArr[i].substring(0, j + 1));

    if(j < stringArr[i].length && !completeWord) {
      j++; 
    }

    if(i < stringArr.length && completeWord) {
      speed = 50;
      j--;
      if(j <= 0) {
        completeWord = false;
        i++;
        if(i == stringArr.length) {
          i = 0;
        } 
        j = 0;
      }
    }

    if(j == stringArr[i].length) {
      completeWord = true;
      speed = 2000;
      j--;
    }

    setTimeout(typeWriter, speed);
  }

  typeWriter();
  
});


// Display selected country flag + name
$("select.select-country").on("change", function () {
  var optionSelected = $(this).find("option:selected");
  var textSelected   = optionSelected.text();

  for (let index = 0; index < countries.response.length; index++) {
    const country = countries.response[index];
    if(country.name == textSelected) {
      const existingFlag = $(".country img.flag");
      
      let flag = document.createElement("img");
      flag.src = `${country.flag}`;
      flag.alt = `${country.name} flag`;
      flag.classList.add("flag");

      if(existingFlag.length != 0) {
        existingFlag.replaceWith(flag);
      } else {
        $("select.select-country").before(flag);
      }
      break;
    }
  }

  fetchTeams(textSelected);

});

// Get matches when the user type something
$(".search-bar input.search-team").keyup(function (e) { 
    const countryName = e.target.value;
    findInputMatches(countryName, teams);
});

// Find teams corresponding to user input
function findInputMatches(teamName, teams) {
  let inputMatches = [];
  const maxTeams = 20;

  // Push found teams into the list
  for (let index = 0; index < teams.length && 
        inputMatches.length < maxTeams; index++) {
    const team = teams[index];
    if((team.team.name).toLowerCase()
      .includes(teamName.toLowerCase())) {
        inputMatches.push(team);
    }
  }

  // Sort teams by matching percentage
  inputMatches.sort((firstTeam, secondTeam) => {
    let firstIdx = firstTeam.team.name.toLowerCase().indexOf(teamName.toLowerCase());
    let secondIdx = secondTeam.team.name.toLowerCase().indexOf(teamName.toLowerCase());

    if(firstTeam.team.name.charAt(firstIdx - 1) == 0) {
      firstIdx = 0;
    }

    if(secondTeam.team.name.charAt(secondIdx - 1) == 0) {
      secondIdx = 0;
    }

    let cmp = firstIdx - secondIdx;
              
    if(cmp != 0) {
      return cmp; 
    }

    return firstTeam.team.name.length - secondTeam.team.name.length;
  });

  // Update DOM, display list of found teams
  const list = inputMatches.map(team => {
    let name = team.team.name;
    let idx = name.toLowerCase().indexOf(teamName.toLowerCase());
    let nameBeforeMatched = name.slice(0, idx);
    let nameMatched = name.slice(idx, idx + teamName.length);
    let nameAfterMatched = name.slice(idx + teamName.length, name.length);

    return `
    <ul class="team-info">
    <li><img src=\"${team.team.logo}\" alt=\"${team.team.name} logo\"></li>
    <li>${team.team.id}</li>
    <li>${nameBeforeMatched}<span class="highlight">${nameMatched}</span>${nameAfterMatched}</li>
    <li>${replaceNull(team.venue.city)}</li>
    <li>${replaceNull(team.venue.name)}</li>
    </ul>`;
  }).join("");

  function replaceNull(string) {
    return (string != null) ? string : "-" 
  }

  // Remove last search teams
  const teamList = $("ul.team-info");
  if(teamList.length > 0) {
    teamList.remove();
  }

  $("ul.header-info").after(list);
  $("ul.team-info li").click(function (event) {
    event.preventDefault();
    $(".selected-team").removeClass("selected-team");

    $(event.target).parent().addClass("selected-team");
    const parent = $(event.target).parent();

    const img = parent.children().eq(0).children().eq(0);
    const teamName = parent.children().eq(2).text();

    // Update selected team logo + favorite team ID
    $(".team-card").css("opacity", "100");
    $("button.pick-fav-btn").css("opacity", "100");
    $(".team-card img").attr("src", img.attr("src"));
    $(".team-card .team-name").text(teamName);
    teamFavoriteId = parent.children().eq(1).text();
    
    }
  );
}

$("ul.team-info li").hover(function (event) {
  const parent = $(event.target).parent();

  // get selected team information from the list
  const img = parent.children().eq(0).children().eq(0);
  const teamName = parent.children().eq(2).text();

  $(".team-card").css("opacity", "100");
  $("button.pick-fav-btn").css("opacity", "100");
  $(".team-card img").attr("src", img.attr("src"));
  $(".team-card .team-name").text(teamName);
  
  teamFavoriteId = parent.children().eq(1).text();
  localStorage.setItem("FootballData-FavTeamID", teamFavoriteId);
});

// update favorite team ID in local storage, then reload website
$(".pick-fav-btn").click(function () {
  localStorage.setItem("FootballData-FavTeamID", teamFavoriteId);
  location.reload();
});
