# Neo4j Music Network
## My Music Discovery
When I was younger I found this strange record store in Reykjavík which blew my mind. All this new and exciting music! Since I lived a bit far away the city I used to talk to a guy that worked there on the phone about music and after each talk he sent me few records via snailmail.
I got to know many great bands and artists like Tortoise, Slint, Do Make Say Think, Papa M, Will Oldham and Godspeed You! Black Emperor which made me redefine music in my mmind. Then I discovered that members of Godspeed were in other bands to and that some members of Tortoise were also in Slint and even more bands. And how many bands were David Pajo associated with anyway? 
What was in the water in Chicago and Montreal?

I realised that the music scene was a complex network of cooperation between a lot of great musicians, and I started reading about various bands but I alswe wanted to see a bigger picture.

And the main question was: are there connections between the people associated with Tortoise and Godspeed You! Black Emperor?

## The Big Picture

Luckily we have a lot of data about musicians on the web and we have tools like Neo4j to do exacly what I wanted to to: see the big picture. So I created a set of tools to enable me to:
- Collect data about bands and band members
- Import the data into a graph database (Neo4j) for visualizing relations between band members

### Extracting Wikipedia Data

Wikipedia contains articles about nearly all the bands that I'm interested in and it's members. By looking at one sample page, the one about [Do Make Say Think](https://en.wikipedia.org/wiki/Do_Make_Say_Think) one will see that it's structured in quite a good way for extracting relevant data

![Screenshot of https://en.wikipedia.org/wiki/Do_Make_Say_Think](https://raw.githubusercontent.com/traustid/neo4j-indie-music/master/img/wikipedia-do-make-say-think.png)

On the top we have the title of the page, a `h1` element with class `firstHeading`. On the right we have a menu with a class `infobox vcard` and in that menu we have the heading "members" followed by a list of names. This information makes it quite easy to simply use jQuery to find data on the page.
For extracting data I created a small Google Chrome extension. It looks for information about "Members" for a band page or "Associated acts" for a member page. If the extension finds a members list, it assumes that we are looking at a band page but if it only finds a "associated acts" section, it assumes that we are looking at a page about a musician.
The data that this extension finds is stored in an array which is then stored in the `localStorage` in the browser in a keyName `wikipedia_music_data`. The extension extracts data after page load so to collect all the data I wanted I simply went to the Tortoise page and then clicked all links to members and associated acts that I found on all relevant pages, that didn't take that long time and I did want to be selective and not automatically extract everything. I started with Tortoise and Godpseed You! Black Emperor and worked my way clicking through a whole lot of pages. In the end I had an array with 581 items, structured like this:

```json
[
    {
        "name": "Doug McCombs",
        "related": "Pullman"
    },
    {
        "name": "Tim Barnes",
        "related": "Pullman"
    },
    {
        "name": "Doug McCombs",
        "related": "Tortoise"
    },
    {
        "name": "Doug McCombs",
        "related": "Brokeback"
    },
    {
        "name": "Dan Bitney",
        "related": "Tortoise"
    }
]
```

There are many ways of saving this data to a file, the way I did was to extent the `console` object in Google Chrome with a `save` method as introduced [here](http://bgrins.github.io/devtools-snippets/#console-save).
Now I could write `console.save(JSON.parse(localStorage.getItem('wikipedia_music_data')))` in the console to save my data to a file.
