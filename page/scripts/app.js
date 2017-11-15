const ipfsURL = window.location.protocol + '//' + window.location.host + '/ipfs/';


const emptyDir = "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn";
const	editableElements = ['content','title', 'childA', 'childB'];

// get this page hash from url.
// ( assumes lcoation.pathname is in form /ipfs/<ipfs hash>)/
const sel = location.pathname.split('/')[2] || 'offchain'

// sel (this pages hash) and j (th contract instance) are in global scope

let j;

let editMode = true;
let cssChanged = false;
let newCSSName;
let newCSSText;
let oldCSSName;

const qs = parseQuery(window.location.search)

window.onload = function() {
	// check if we are in edit mode.
	if (qs && qs['edit']) {
		// if so add edit buttons etc
		clearFields(editableElements);
		addEditElements(editableElements);
	}

	// init web3
    let Juncture = web3.eth.contract(abi);
	j = Juncture.at(contractAddress);

	// Load child addresses if they exist
	// otherwise will make edit page link
    getMyChild(j, sel, 0, 'childA');
    getMyChild(j, sel, 1, 'childB');

	// update page title with 'title' element
    document.getElementById('title').onchange = function(e) {
    	document.title = this.innerText + ' - Juncture';
    }

    initNavBar();

}


// Editor UI stuff
function addEditElements(_editableElements){
	makeFieldsEditable(_editableElements);
	addEditCSS();
	addSaveButton();
	editModeKeyEvents();
	addEditMessage();
}

function removeEditElements(_editableElements){
	makeFieldsUneditable(_editableElements);
	turnOffAllContentEditable(_editableElements);
	removeSaveButton();
	removeEditCSS();
	removeEditMessage();	
}



function makeFieldsEditable(_editableElements){
	// enters edit mode (doesn't make individual elements 'contentEditable')
	for (let i = 0; i < _editableElements.length; i++) {
		let el = document.getElementById(_editableElements[i]);
		if (!el.onchange) {
			el.onchange = function(){}
		}
		el.classList.add('editable');
	}
	document.onmousedown = function(event) {
		turnOffAllContentEditable(_editableElements);
		if (event.target.classList.contains('editable')) {
			event.target.contentEditable = 'true';
		}
		if (event.target.parentElement.classList.contains('editable')) {
			event.target.parentElement.contentEditable = 'true';
		}
	}
}


function makeFieldsUneditable(_editableElements){
	// hides 'editmode' t allow pag preview on spacebar press
	for (let i = 0; i < _editableElements.length; i++) {
		let el = document.getElementById(_editableElements[i]);
		el.classList.remove('editable');
		el.onmouseenter = function(event) {
			// 
		}
		el.onfocus = el.onmouseenter;
		el.onmouseleave = el.onmouseenter;
		el.onblur = el.onmouseenter;
	}
}

function turnOffAllContentEditable(_editableElements) {
	for (let i = 0; i < _editableElements.length; i++) {
		document.getElementById(_editableElements[i]).contentEditable = 'false';
		document.getElementById(_editableElements[i]).onchange();
	}
}

function editModeKeyEvents() {
	// enter view mode if 'space' is pressed
    document.addEventListener('keydown', (event) => {
    	let keyName = event.key;
    	if (keyName == ' '){
	    	if (! editMode) {
	    		return;
	    	}
	    	editMode = false;
	    	for (let i = 0; i < editableElements.length; i++) {
	    		if (document.getElementById(editableElements[i]).contentEditable == 'true') {
	    			return
	    		}
	    	}
  			removeEditElements(editableElements);
    		
    	}
	});
    document.addEventListener('keyup', (event) => {
    	let keyName = event.key;
  		if (keyName == ' ') {
  			if (editMode == true) {
    			return;
    		}
    		editMode = true;
   	    	for (let i=0; i < editableElements.length; i++) {
	    		if (document.getElementById(editableElements[i]).contentEditable == 'true') {
	    			return
	    		}
	    	}
			addEditElements(editableElements);
  		}
	});
}

function addSaveButton() {
	let endBits = document.getElementById('endBits');
	let saveButton = document.createElement('div');
	saveButton.id = "save";
	saveButton.innerText = "Save";
	saveButton.onclick = function(event) {
		let file = saveSnapshot();
		upload(file, function(hash) {
			addPage(j, hash, sel, qs['child'])
		});
	}
	endBits.appendChild(saveButton);
}

function addEditCSS() {
	let endBits = document.getElementById('endBits');
	let input = document.createElement('input');
	input.type = 'file';
	input.id = "editCSS";

	let label = document.createElement('label');
	label.id = 'editCSSButton';
	label.setAttribute('for', 'editCSS');
	label.innerText = 'upload CSS';
	input.onchange = function(event) {
		let file = event.target.files[0];
		newCSSName = file.name
		// This loads the new css as a dataURL to give preview
		let dataURLReader = new FileReader();
		dataURLReader.addEventListener('load', function() {
			// need this so we can remove it frm directory later
			if (!oldCSSName) {
				oldCSSName = document.getElementsByTagName('link')[1].href.split('/').reverse()[0]; 
			}
			// assumes that the relevant *.css is [1] (after juncture.css)
			document.getElementsByTagName('link')[1].href = dataURLReader.result;
		})
		dataURLReader.readAsDataURL(file);
		
		// Now read file as text ready to send to IPFS
		let textReader = new FileReader();
		textReader.addEventListener('load', function() {
			newCSSText = textReader.result;
		})
		textReader.readAsText(file);

		cssChanged = true;
	}
	endBits.appendChild(label)
	input.style.display = 'none';
	endBits.appendChild(input);
}

function removeSaveButton() {
	document.getElementById('save').remove();
}

function removeEditCSS() {
	document.getElementById('editCSS').remove();
	document.getElementById('editCSSButton').remove();
}

function clearFields(_editableElements) {
	for (let i = 0; i < _editableElements.length; i++) {
		document.getElementById(_editableElements[i]).innerText = "(" + _editableElements[i] + ")";
	}
}

function addEditMessage() {
	let div = document.createElement('div');
	let header = document.getElementsByTagName('header')[0];
	let main = document.getElementsByTagName('main')[0];
	div.id = 'editMessage';
	div.innerText = 'You are in edit mode. Press the <space> bar to preview.'
	main.insertBefore(div, header)
}

function removeEditMessage() {
	let div = document.getElementById('editMessage')
	div.remove();
}

// Dashboard UI stuff

function initNavBar() {
	// Check if page is on chain
	j.pageExists(sel, function(err, res) {
		if (err) {
			console.log('contract not registered')
		} else {
			if (!res) {
				let el = document.getElementById('nav_message');
				el.style.display = 'block'
				let dashboard = document.getElementById('dashboard')
				el.innerHTML = 'Page not yet registered.. wait a while and reload :)';
				dashboard.style['background-color'] = '#BB4444';
				dashboard.style.height = '60px';
				let info = document.getElementsByClassName('nav_info')
				for(let i = 0; i < info.length; i++) {
					info[i].style.display = 'none'
				}

			}

		}

	})

	if (contractAddress == 'offchain') {
		document.getElementById('nav_contractAddress').innerText = 'offchain  (filler to  make it roughly the right length)';
	} else {
		let a = document.createElement('a');
		a.href = "https://ropsten.etherscan.io/address/" + contractAddress;
		a.innerText = contractAddress;
		document.getElementById('nav_contractAddress').appendChild(a)
	}
	if (sel) {
		let a = document.createElement('a');
		a.href = ipfsURL + sel;
		a.innerText = sel;
		document.getElementById('nav_pageAddress').appendChild(a)	
	}
	if (parent) {
		let a = document.createElement('a');
		a.href = ipfsURL + parent;
		a.innerText = parent;
		document.getElementById('nav_parentAddress').appendChild(a)
	} else {
		document.getElementById('nav_parentAddress').innerText = 'orphan (with addd spacing just for testing purposes';
	}
	// get deposit
	j.deposit(function(err, res) {
		if (err) {
			console.log('deposit function went wrong... contract not initialised??');
			return;
		}
		document.getElementById('nav_contractDeposit').innerText = res.toNumber();

	})

	// get startNode
	j.startNode(function(err, res) {
		if (err) {
			console.log('deposit function went wrong... contract not initialised??');
			return;
		}
		let a = document.createElement('a');
		a.href = ipfsURL + res;
		a.innerText = res;
		document.getElementById('nav_startNode').appendChild(a);
	})
}

function purgeNavBar() {
	let navInfo = document.getElementsByClassName('nav_info');
	for (let i = 0; i < navInfo.length; i++) {
		navInfo[i].getElementsByClassName('value')[0].innerHTML = '';
	}
}

// Save page functions

function saveSnapshot() {
	// This removes all traces of editor, and a few other unique elements, 
	// from the raw html of the page, and returns the cleansed html for
	// uploading
	removeEditElements(editableElements);
	purgeNavBar();

	let f = document.documentElement.outerHTML;
	// find if we have injected scrpt
	// (specifically, remove) metamask inpage.js or it will propagate like a cancer
	let injectedJSStart = f.search("<script>");
	if (injectedJSStart >= 0) {
		injectedJSEnd = f.search("</script>");
		f = f.slice(0,injectedJSStart) + f.slice(injectedJSEnd + 9);
	}

	// replace 'var parent'
	let parentStart = f.search("const parent");
	let parentEnd = parentStart + f.slice( parentStart).search(';');
	f = f.slice(0,parentStart) + "const parent = '" + sel + "'" + f.slice(parentEnd);

	// replace 'var child'
	let childStart = f.search("const child");
	let childEnd = childStart + f.slice(childStart).search(';');
	f = f.slice(0,childStart) + "const child = " + qs['child'] + f.slice(childEnd);	

	// replace css href=data ith style/filename.css
	let hrefStart = f.search('href="data:');
	if (hrefStart >= 0) {
		let hrefEnd = f.slice(hrefStart).search(">") + hrefStart;
		f = f.slice(0, hrefStart) + 'href="styles/' + newCSSName + '"' + f.slice(hrefEnd);
	}
	// add the edit things back
	addEditElements(editableElements);
	initNavBar();
	return f;
}

function upload(f, cb) {
	// remove index.html from current directory (this is all we ar replacing by default)
	// this returns the hash of the directory minus index.html

	// TODO this is a mess.. misses the point of promises.. need to refactor
	fetch(ipfsURL + sel + "/index.html", {
		method: 'DELETE',
	}).then(function(response) {
		// add 'f' (our new index.html) to the returned directory
		let hash = response.headers.get('Ipfs-Hash');
		fetch(ipfsURL + hash + "/index.html", {
			method: 'PUT',
			body: f,
		}).then(function(response) {
			let hash = response.headers.get('Ipfs-Hash');
			if (cssChanged) {
				fetch(ipfsURL + hash + "/styles/" + newCSSName, {
				method: 'PUT',
				body: newCSSText,
				}).then( function(response) {
					let hash = response.headers.get('Ipfs-Hash');
					fetch(ipfsURL + hash + "/styles/" + oldCSSName, {
						method: 'DELETE',
					}).then(function(response) {
						// add new CSS to folder before uploading
						hash = response.headers.get('Ipfs-Hash');
						console.log("added page:" + hash);
						cb(hash);
					})
				})
			} else {
				if (!hash) {
					console.log('whoops, something went wrong! failed to add page');
					return
				}
				// no new css. Just call cb
				console.log("added page: " + hash);
				cb(hash);
			} 
		})
	})
}


function getMyChild(j, parent, childno, id) {
  j.getchild(parent, childno, function(err, res) {
    let el = document.getElementById(id);
    if (err) {
      el.innerText = err;
    } else {
      if (res[0] && res[1]) {
        el.href = ipfsURL +res[1];
      } else {
        el.href = "?edit=true&child=" + childno;
      }
    }
  })
}

function addPage(j, hash, parent, child) {
	let a = document.createElement('a')
	a.href = ipfsURL + hash;
	a.innerText = hash;
	document.getElementById('editMessage').innerText = "Adding new page. address: " + hash + ". Just waiting for confirmation...";
	document.getElementById('editMessage').appendChild(a);
	j.addPage( hash, parent, child, function(err, tHash){
		// leave these logs for now for debugging
		if (err) {
			console.log("addPage errored");
			console.log(err);
		} else {
			e = j.LogNewPage();
			e.watch(function(err, res){
				if (res.transactionHash == tHash) {
					let a = document.createElement('a');
					a.href = ipfsURL + hash;
					a.innerText = hash;
					document.getElementById('editMessage').innerText = "Page successfully added!";
					document.getElementById('editMessage').appendChild(a);
					e.stopWatching();
				}
			})
			console.log(tHash)
		}
	})
}

function parseQuery(queryString) {
    let query = {};
    let pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (let i = 0; i < pairs.length; i++) {
        let pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}