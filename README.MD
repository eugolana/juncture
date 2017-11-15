# Juncture - distriuted, collaborative, choose-your-own-adventure using IPFS and Ethereum #

## How to Use##

### Read only access ###
1. Install metamask plugin. This will give you access to the ethereum blockchain, which holds the links between pages and run metamask on 'Ropsten' test network
2. Install IPFS. This will give you access to IPFS, the Inter-Planetary File System, which holds all of the page data.
3. Run the IPFS node using the command 'ipfs daemon'
3. Navigate to page #

### Read/Write access ###
1. Follow the above steps
2. Replace your .ipfs/config with [[enter filename?]]

### Add a page ###

#### Clone Page ####
Clicking on a link to a non-existant page will take you into edit mode. This gives you the ability to 'clone' the current markup with your own text, title, and link text. 

#### Edit page markup/css ####
*warning* this could add a page which does not conform to the expected behavior. To be safe ensure there are link elements labeled 'childA' and 'childB', and that 'getMyChild' is called on each, and that it sends the current page address as the first argument

1. Ensure you have an ethereum account with funds (currently on the Ropsten testnet)
2. Clone this repo
3. Make edits to the contents of 'page/'
4. Run 'ipfs add -r page'
5. Copy the returned top level ipfs address ('added [ipfs hash starting "Qm"') page
6. Send 'addPage' request to the Juncture contract, with the arguments (yourHash, parentHash, childno) where childno is 0 for left and 1 for right