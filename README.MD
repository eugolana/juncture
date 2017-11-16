# Juncture - distriuted, collaborative, choose-your-own-adventure using IPFS and Ethereum 

## Rationale

For a while I've been following some of the new generation of decentralised technologies, and thought it was time to put my code where my mouth is and actually learn how they work from a more pratical perspective. I was looking or a project that was a) realistic (given my inexperience), b) fun & thought provoking, and c) low stakes. 

The idea for a 'choose-your-own-adventure' type project has been floating around my head for a while. Technologies develop over time (duh), and decisions made at an early stage of their development, while parameter an expectation are still malleable, can have great ramifications down the line (what economists call 'path dependence' and the rest of us call 'history' or 'the passage of time'). In the case of a massively distributed technology like Ethereum, these key junctures demand the input of whole communities, with various individuals and institutions with often antagonistic interests each throwing in their tuppence (or throwing around their weight) to try and sway things on way or another.



## How to Use 
Juncture is far from a polished product, but I feel like it's come together enough to throw it out there for others to play around with. It is currenty live on the Ropsten Test network, and the startpage can be found at 'https://gateway.ipfs.io/ipfs/QmUn1kuLyQ6XhrGuAQZqARnXubqQeYY5xuDgEkBvgNYhVo/'

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

IPFS can be thught of a 'content-addressed' network. This means that rather than etch a file by going to a particular location and hoping it is there, you ask the network for a particular file (via its 'hash') and the network finds someone with a copy of that file hooks you up with it. For the network to function, users ('nodes') must 'pin' files, which basically means to hold on to it for anyone on the network to grab. If nobody else pins files, then this 'decentralised' network, then it could end up completely dependent on me! (not very decentralised)

I hope to write a small script to grab all of the addresses for all Juncture pages, to make it easy for people to help by carrying all the files, but I haven't got round to this yet.. For now you'll have to do it manually through `ipfs pin <Ipfs-Hash>`