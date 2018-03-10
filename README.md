# Neo4j Indie Music Network
## My Music Discovery
When I was younger I found this strange record store in Reykjavík which blew my mind. All this new and exciting music! Since I lived a bit far away the city I used to chat on the phone with one of the guys that worked there and after each talk he sent me few records via snailmail.
I got to know many great bands and artists like Tortoise, Slint, Do Make Say Think, Papa M, Will Oldham and Godspeed You! Black Emperor (which made me redefine music in my mmind). I discovered that members of Godspeed were in other bands to and that some members of Tortoise were also in Slint and even more bands. And how many bands were David Pajo associated with anyway? 
What was in the drinking water in Chicago and Montreal?

I realised that the music scene was a complex network of cooperation between a lot of great musicians so I started reading about various bands but I also wanted to see a bigger picture.

And one of the questions were: are there connections between the people associated with Tortoise and Godspeed You! Black Emperor?

## The Big Picture

Luckily we have a lot of data about musicians on the web and we have great tools like Neo4j to do exacly what I wanted to to: see the big picture. So I created a set of tools to enable me to:
- Collect data about bands and band members, making it a little simpler that manually copying and pasting
- Import the data into a graph database (Neo4j) for visualizing relations between band members

## Extracting Wikipedia Data

Wikipedia contains articles about nearly all the bands that I'm interested in and it's members. By looking at one sample page, the one about [Do Make Say Think](https://en.wikipedia.org/wiki/Do_Make_Say_Think) one will see that it's structured in quite a good way for extracting relevant data

![Screenshot of https://en.wikipedia.org/wiki/Do_Make_Say_Think](https://raw.githubusercontent.com/traustid/neo4j-indie-music/master/img/wikipedia-do-make-say-think.png)

On the top we have the title of the page, a `h1` element with class `firstHeading`. On the right we have a table with the class `infobox vcard` and in that table we have the heading "members" followed by a list of names. This information makes it quite easy to simply use jQuery to find data on the page.

For extracting data I created a small Google Chrome extension. It looks for a list of names following a table heading containing the text "Members" for a band page or "Associated acts" for a musician page. If the extension finds a members list, it assumes that we are looking at a band page but if it only finds a "associated acts" section, it assumes that we are looking at a page about a musician. I most cases this works well although some data cleaning is required, I'll get to that later.

The data that this extension finds is stored in an array which is then stored in the `localStorage` object in the browser in a key named `wikipedia_music_data`. The extension extracts data after page load so to collect all the data I wanted I simply went to a Wikipedia page abut a band and then clicked all links to members and associated acts that I found on all relevant pages. One might question this method since it doesn't sound that automated. This however didn't take that long time and I did want to be selective and not automatically extract everything although I might try to do that later at some point! I started with Tortoise and Godpseed You! Black Emperor and worked my way clicking through a whole lot of pages. I also clicked on a lot of links starting with pages about bands like Galaxy 500, Built To Spill, The Flaming Lips and Slowdive, to see if we could find connections there to the Tortois/Godspeed network. In the end I had an array with about 1000 items.

The data is structured like this, band members are stored in the `name` field and related bands in the `related` field:
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

Before going further I had to clean the data a bit. For example: The Silver Mt. Zion goes by othen names like The Silver Mt. Zion Memorial Orchestra & Tra-La-La Band. To make sure that they only got one entity I simply used find & replace in a text editor to normalize the name. I also looked for other things, for example text like "(singer)" which sometimes was attached to a persons name and removed those. Will Oldham also appeared in some cases as a band instead of a person. This cleaning took only few minutes.

## Saving the Data
There are many ways of saving this data from the `localStorage` object to a file, the way I did was to extent the `console` object in Google Chrome with a `save` method as introduced [here](http://bgrins.github.io/devtools-snippets/#console-save).
Now I could write `console.save(JSON.parse(localStorage.getItem('wikipedia_music_data')))` in the console to save my data to a file.

## Importing Data to Neo4j
Neo4j is a graph database specially built to handle and visualize network data, so it was the perfect tool for the job. To be able to test you must first download and install Neo4j and create an empty database for our data.

Since we have the same names appearing over and over in our data, we want to make sure that each name can only be stored once. If we were to work with much bigger data we might have a problem with persons having the same name but given that this dataset is quite small I didn't consider this to be a problem. To ensure that each name can only be stored once we need to create a constraint using Cypher in the Neo4j browser:

```
CREATE CONSTRAINT ON (person:Person) ASSERT person.name IS UNIQUE
CREATE CONSTRAINT ON (group:Group) ASSERT group.name IS UNIQUE
```

In Neo4j, data consists of nodes which are connected by relationships. In our case, bands and band members are nodes. In the json output of the Wikipedia data, we have band members in one field (`name`) and band names in another (`related`). First we need to import all persons as type `Person` and all bands as another type which I choose to call `Group`. After that we need to add all relationships between persons and bands.

To do this I created a small [JavasScript tool](https://github.com/traustid/neo4j-indie-music/blob/master/neo4j-import/indiemusic-import.js). This script takes in as argument an input file and an action parameter which can be either `nodes` or `relationships`. First we need to run it with the `nodes` parameter to import all nodes and then import all the relationships using `relationships`.
```
node indiemusic-import.js --login=neo4j:neo4j --input=input\indiemusic.json --action=nodes
node indiemusic-import.js --login=neo4j:neo4j --input=input\indiemusic.json --action=relationships
```

The JavaScript file creates cypher queries for importing persons, groups and relationships between them. Once that is done we can start looking at the graph visualization using the Neo4j Browser.

## Digging into the network

First, we might get a graph with Tortoise as a center around it's members and other bands they might be associated with with a simple query:
```cypher
MATCH (n1:Group {name: 'Tortise'})-[r1]-(n2) OPTIONAL MATCH (n2)-[r2]-(n3) RETURN n1, r1, n2, r2, n3
```
I however think it's more interesting to dig a little deeper and luckily, cypher gives us the option of selecting how many related nodes we want to receive and visualize from a given node:
```cypher
MATCH (a:Group {name: 'Tortoise'})-[r:ASSOCIATED_WITH*1..3]-(d) RETURN a, r, d
```
![The Tortoise network](https://raw.githubusercontent.com/traustid/neo4j-indie-music/master/img/tortoise-network.png)

Here we get quite an interesting network. On the picture I have selected Tortoise in the center. One of Tortoise member is David Pajo which on the graph is show associated with 9 other bands. We also see that not so far away from Tortoise are bands like Yeah yeah yeas, Eleventh Dream Day and The Sea and Cake, most of them American and from an area not that far away from Chicago.
```cypher
MATCH (a:Group {name: 'Godspeed You! Black Emperor'})-[r:ASSOCIATED_WITH*1..3]-(d) RETURN a, r, d
```
![The Godspeed You! Black Emperor network](https://raw.githubusercontent.com/traustid/neo4j-indie-music/master/img/godspeed-network.png)

The network three nodes away from Godspeed You! Black Emperor also gives a picture that is familiar, yet with a lot of new names. There are bands like Set Fire to Flames, A Silver Mt. Zion, HRSTA and Molasses.

Looking closely into these two networks, around Tortoise and Godspeed You! Black Emperor we find two names that appear on both of them, Charles Spearin and Brendan Canning. Spearin is a founding member of the canadian band Do Make Say Think and he's also a member of Broken Social Scene, which appeared in the Tortoise graph, and Canning is also a member of Broken Social Scene. Here we seem to have a connection between Tortoise and Godspeed You! Black Emperor.

To check this out for real we can use cypher's `allShortestPaths` method to get shortest path between two nodes:
```cypher
MATCH (a:Group {name: 'Tortoise' }),(b:Group { name: 'Godspeed You! Black Emperor'}), p = allShortestPaths((a)-[*]-(b)) RETURN p
```
![Shortest path between Tortoise and Godspeed You! Black Emperor](https://raw.githubusercontent.com/traustid/neo4j-indie-music/master/img/godspeed-tortoise-relations.png)

Here we see that both Charles Spearin and Brendan Canning are in the band Walley of Giants along with Sophie Trudeau which is also a member of Godspeed You! Black Emperor.

We can attempt to see the whole network by retreiving all nodes 6 nodes away from both Tortoise and Godspeed You! Black Emperor:
```cypher
MATCH (a:Group)-[r*1..6]-(d) WHERE a.name = 'Tortoise' OR a.name = 'Godspeed You! Black Emperor' RETURN a, r, d
```
![The whole Tortoise and Godspeed You! Black Emperor network](https://github.com/traustid/neo4j-indie-music/blob/master/img/whole-network.png)

This network illustrates four main clusters, which each of them centers around Tortoise, Broken Social Scene, Godspeed You! Black Emperor and surprisingly Sonic Youth!

![The whole Tortoise and Godspeed You! Black Emperor network](https://raw.githubusercontent.com/traustid/neo4j-indie-music/9fc7884974317e9e0773fcd6ac6b65abb29d06a4/img/whole-network-clusters.png)

## Making it simpler doesn't always make things simpler

Cypher can simplify networks by adding relations between nodes that have one node in between. In this case we can visualize a network without the people and with direct relationships between bands. To do this we use the `UNWIND` method of Cypher:
```cypher
MATCH (g1:Group)<-[:ASSOCIATED_WITH]-(p:Person)-[:ASSOCIATED_WITH]->(g2:Group) WITH g1, collect(distinct g2) as gs UNWIND gs as g2 MERGE (g1)-[r:SHARE_MEMBERS]-(g2) RETURN g1, r, g2
```
![The whole network simplified](https://github.com/traustid/neo4j-indie-music/blob/master/img/whole-network-simplified.png)

This does give a different picture but I still like the previous version better, with all the band members included. This is quite dense and hard to read and what are bands without it's members anyways?

Flaws:
- Selective, not automatic
- Relationships can be of various types
- Relationships are added without further research
