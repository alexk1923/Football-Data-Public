# FootballData

![Website Logo](./img/logosite.png)

## *Description*

Football Data is an one-page webiste that provides the user with information about his favorite
football team. The website depends on 2 APIs: one for general team data as name, logo, current
season results, the other for searching news about the team.

**Technologies used**: *HTML*, *CSS (SCSS)*, *JavaScript ES8 (+jQuery)*

**Aditional**: *Football API*, *News API*

It requires 2 **API Keys** that need to be completed in [JavaScript File](./js/script.js).

## *Website Structure*

### Navigation Menu

Sticky menu displaying links to each section of the website, the selected one has an underline
effect to improve UX. The logo and name are anchors to main page.

### Select Country/Team

A star next to the logo indicates the team that is the current marked as favorite.

The typewriter-like implementation of a paragraph suggests the user what he has to do.
To find his team, the user must first choose a nation and then utilize the search box. 
The *select* element uses a list of countries from the *Football API*. . Once a nation has been chosen,
an API request is made to retrieve all of its teams. A team's name can be typed into the search field
to find it.

A list of teams that have been found is updated each time a key is pressed.
The team's name, logo, city, and stadium are displayed. The input and the part of the team name
that match are highlighted.

### News Section

Top headlines from Romanian news publication are retrived based on the favorite team name
and displayed to the user as cards. When clicked, each card redirects to the source article.

### Footer

My contact links:
- [GitHub](https://github.com/alexk1923)
- [LinkedIn](https://www.linkedin.com/in/alexandru-kullman/)
- [Mail](mailto:alexandrukullman@gmail.com)




