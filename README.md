# Neo4j Music Network
## My Music Discovery
When I was younger I found this strange record store in Reykjavík which blew my mind. All this new and exciting music! Since I lived a bit far away the city I used to talk to a guy that worked there on the phone about music and after each talk he sent me few records via snailmail.
I got to know many great bands and artists like Tortoise, Slint, Do Make Say Think, Papa M, Will Oldham and Godspeed You! Black Emperor which made me redefine music in my mmind. Then I discovered that members of Godspeed were in other bands to and that some members of Tortoise were also in Slint and even more bands. And how many bands were David Pajo associated with anyway? 
What was in the water in Chicago and Montreal?

I realised that the music scene was a complex network of cooperation between a lot of great musicians, and I started reading about various bands but I alswe wanted to see a bigger picture.

## The Big Picture

Luckily we have a lot of data about musicians on the web and we have tools like Neo4j to do exacly what I wanted to to: see the big picture. So I created a set of tools to enable me to:
- Collect data about bands and band members
- Import the data into a graph database (Neo4j) for visualizing relations between band members

### Extracting Wikipedia Data

Wikipedia contains articles about nearly all the bands that I'm interested in and it's members. By looking at one sample page, the one about [Do Make Say Think](https://en.wikipedia.org/wiki/Do_Make_Say_Think) one will see that it's structured in quite a good way for extracting relevand data.
