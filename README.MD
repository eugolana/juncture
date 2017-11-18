# Juncture - distriuted, collaborative, choose-your-own-adventure using IPFS and Ethereum 

## be warned
This project is a bit of fun. It is currently functinoal (I hope!) but far from a finished project. No external audits, or automated testing, has taken place. It is currently running on the Ropsten test network, and I don't plan on taking it to the main network any time soon. I hope the code here can be a useful educational tool, but I have developed it with a mind to get my head around smart contract coding and get to a functional product asap, rather than taking security concerns etc as seriously as should be done in the high stakes environment that many smart contracts function. 

## Rationale

For a while I've been following some of the new generation of decentralised technologies, and thought it was time to put my code where my mouth is and actually learn how they work from a more pratical perspective. I was looking or a project that was a) realistic (given my inexperience), b) fun & thought provoking, and c) low stakes. 

The idea for a 'choose-your-own-adventure' type project has been floating around my head for a while. Technologies develop over time (duh), and decisions made at an early stage of their development, while parameter an expectation are still malleable, can have great ramifications down the line (what economists call 'path dependence' and the rest of us call 'history' or 'the passage of time'). In the case of a massively distributed technology like Ethereum, these key junctures demand the input of whole communities, with various individuals and institutions with often antagonistic interests each throwing in their tuppence (or throwing around their weight) to try and sway things on way or another.

In this sense, Juncture aims to encourage participants to think about how we forge common narratives and assert ourselves collectively at these crossroads.

I have 'seeded' a few narratives, but Juncture is open to be taken wherever paticipants choose to take it, the possibilities are (almost) literally endless.


## How it works
Each 'page' can link to two 'children'. If a user finds an empty child link they are presented an editor which allows them to add a new page at this spot.

The 'business logic' sits on the Ethereum blockchain (currently the Ropsten test network). A small 'deposit' is payed to add a page in an empty spot. 50% of this deposit goes to the parent page, and 25% to the grandparent. The remaining 25% will, in theory, go into a common pot managed by a some kind of govering committee (multi signature account), and can hypothetically be used to pay for hosting (information is not, as some prophesized, free ;) ) and development costs. 

The page content itself, and any assets, are stored on IPFS. Users running a 'writable' [sic] IPFS node are able to add pages through their browser. pages can also be added manually (forinformation see below).

Using the built in page-generator, each page inherits markup and  (by default) and .css from its parent. There is nothing stopping anyone from manually adding a page written from scratch or forked from the 'page' folder in this repo (more tutorials coming soon showing how to do this.) 

Eventually, I think there would need to be a mechanism for removing offensive/spam content. My current thought is to allow the owner of a 'parent' page to 'flag' a child that they would like removed (possibly supplying a small deposit). The 'governing committee' account could then decide whether the page meets an explicit and public list of deletion criteria (contains illegal material, is spam, contains racist/transphobic/homophobic/sexist etc. language, etc). This, however, is a debate to be had in the future if I or anyone else wants to take the concept forwards. For now, the 25% of accumulated RopstenEther just sits there on the contract, and there is no way to delete a page.

## How to Use 
As I have mentioned, Juncture is far from a polished product, but I feel like it's come together enough to throw it out there for others to play around with. It is currenty live on the Ropsten Test network, and the startpage can be found at 'https://gateway.ipfs.io/ipfs/QmUn1kuLyQ6XhrGuAQZqARnXubqQeYY5xuDgEkBvgNYhVo/'

### Read only access 
1. Install metamask plugin. This will give you access to the ethereum blockchain, which holds the links between pages and run metamask on 'Ropsten' test network
2. head to 'https://gateway.ipfs.io/ipfs/QmUn1kuLyQ6XhrGuAQZqARnXubqQeYY5xuDgEkBvgNYhVo/' (I'll try to keep this link updated here..)

### Read/Write access 
1. Follow the above steps
2. install ipfs
3. run `ipfs daemon --writable` (note typo - `--writable` rather than `--writeable`)

### Add a page 

#### Clone Page 
Clicking on a link to a non-existant page will take you into edit mode. This gives you the ability to 'clone' the current markup with your own text, title, and link text. 

#### Edit page markup/css 
*warning* this could add a page which does not conform to the expected behavior. To be safe ensure there are link elements labeled 'childA' and 'childB', and that 'getMyChild' is called on each, and that it sends the current page address as the first argument

1. Ensure you have an ethereum account with funds (currently on the Ropsten testnet)
2. Clone this repo
3. Make edits to the contents of 'page/'
4. Run 'ipfs add -r page'
5. Copy the returned top level ipfs address ('added [ipfs hash starting "Qm"') page
6. Send 'addPage' request to the Juncture contract, with the arguments (yourHash, parentHash, childno) where childno is 0 for left and 1 for right


#### pin pages!

IPFS can be thought of a 'content-addressed' network. This means that rather than etch a file by going to a particular location and hoping it is there, you ask the network for a particular file (via its 'hash') and the network finds someone with a copy of that file hooks you up with it. For the network to function, users ('nodes') must 'pin' files, which basically means to hold on to it for anyone on the network to grab. If nobody else pins files, then this 'decentralised' network, then it could end up completely dependent on me! (not very decentralised)

Hover your mouse at the top of a page to open the nav menu, and click 'pin all pages'. This will give you a command which can be copy-pasted into your console to pin all the currently regiterd pages (note, there is no safeguard currently in place. Do so at your own risk!)