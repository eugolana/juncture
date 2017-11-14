var ipfsURL = "http://127.0.0.1:8080/ipfs/";


var emptyDir = "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn";
var	editableElements = ['content','title', 'childA', 'childB'];

// get this page hash from url
var sel = location.pathname.split('ipfs/')[1] || 'offchain'
sel = sel.split('/')[0]
// sel (this pages hash) and j (th contract instance) are in global scope

var j;

var editMode = true;
var cssChanged = false;
var newCSSName;
var newCSSText;
var oldCSSName;

var qs = parseQuery(window.location.search)

window.onload = function() {
	// check if we are in edit mode.
	if (qs && qs['edit']) {
		// if so add edit buttons
		// addEditButtons(editableElements);
		makeFieldsEditable(editableElements);
		clearFields(editableElements);
		addEditCSS();
		addSaveButton();
		editModeKeyEvents();
	}
	// init web3

    var Juncture = web3.eth.contract(abi);
	j = Juncture.at(contractAddress);
	console.log("sucessfully made contract instance");
	console.log(j);

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


function makeFieldsEditable(_editableElements){
	// enters edit mode (doesn't make individual elements 'contentEditable')
	for (var i = 0; i < _editableElements.length; i++) {
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
	for (var i = 0; i < _editableElements.length; i++) {
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
	for (var i = 0; i < _editableElements.length; i++) {
		document.getElementById(_editableElements[i]).contentEditable = 'false';
		document.getElementById(_editableElements[i]).onchange();
	}
}

function editModeKeyEvents() {
	    // enter view mode if 'space' is pressed
    document.addEventListener('keydown', (event) => {
    	const keyName = event.key;
    	if (! editMode) {
    		return;
    	}
    	editMode = false;
    	for (var i=0; i < editableElements.length; i++) {
    		if (document.getElementById(editableElements[i]).contentEditable == 'true') {
    			return
    		}
    	}
  		if (keyName == ' ') {
  			makeFieldsUneditable(editableElements);
  			removeSaveButton();
  			removeEditCSS();
  		}
	});
    document.addEventListener('keyup', (event) => {
    	const keyName = event.key;
    	editMode = true;
    	for (var i=0; i < editableElements.length; i++) {
    		// ignore key hit if we are actually editing a field
    		if (document.getElementById(editableElements[i]).contentEditable == 'true') {
    			return
    		}
    	}
  		if (keyName == ' ') {
  			makeFieldsEditable(editableElements);
			addSaveButton();
			addEditCSS();
  		}
	});
}

function addSaveButton() {
	let page = document.getElementsByTagName('main')[0];
	let input = document.createElement('input');
	input.type = 'button';
	input.id = "save";
	input.value = "save to ipfs";
	input.onclick = function(event) {
		let file = saveSnapshot();
		upload(file, function(hash) {
			addPage(j, hash, sel, qs['child'])
		});
	}
	page.appendChild(input);
}

function addEditCSS() {
	let page = document.getElementsByTagName('main')[0];
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
	page.appendChild(label)
	input.style.display = 'none';
	page.appendChild(input);
}

function removeSaveButton() {
	document.getElementById('save').remove();
}

function removeEditCSS() {
	document.getElementById('editCSS').remove();
	document.getElementById('editCSSButton').remove();
}

function clearFields(_editableElements) {
	for (var i = 0; i < _editableElements.length; i++) {
		document.getElementById(_editableElements[i]).innerText = "(" + _editableElements[i] + ")";
	}
}


function saveSnapshot() {
	makeFieldsUneditable(editableElements);
	turnOffAllContentEditable(editableElements);
	removeSaveButton();
	removeEditCSS();
	var f = document.documentElement.outerHTML
	// find it we have injected scrpt
	// for example metamask
	let injectedJSStart = f.search("<script>")
	if (injectedJSStart >= 0) {
		// strip out injected js (or it will be injected again and again etc...)
		injectedJSEnd = f.search("</script>")
		f = f.slice(0,injectedJSStart) + f.slice(injectedJSEnd + 9);
	}
	// replace 'var parent'
	let parentStart = f.search("var parent")
	let parentEnd = parentStart + f.slice( parentStart).search(';')
	f = f.slice(0,parentStart) + "var parent = '" + sel + "'" + f.slice(parentEnd);

	// replace css href=data ith style/filename.css
	let hrefStart = f.search('href="data:');
	if (hrefStart >= 0) {
		let hrefEnd = f.slice(hrefStart).search(">") + hrefStart;
		f = f.slice(0, hrefStart) + 'href="styles/' + newCSSName + '"' + f.slice(hrefEnd)
	}

	// replace 'var child'
	let childStart = f.search("var child")
	let childEnd = childStart + f.slice(childStart).search(';')
	f = f.slice(0,childStart) + "var child = " + qs['child'] + f.slice(childEnd);	

	makeFieldsEditable(editableElements);
	addSaveButton();
	addEditCSS();
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
			var hash = response.headers.get('Ipfs-Hash')
			if (cssChanged) {
				fetch(ipfsURL + hash + "/styles/" + newCSSName, {
				method: 'PUT',
				body: newCSSText,
				}).then( function(response) {
					hash = response.headers.get('Ipfs-Hash');
					fetch(ipfsURL + hash + "/styles/" + oldCSSName, {
						method: 'DELETE',
					}).then(function(response) {
						// add new CSS to folder before uploading
						hash = response.headers.get('Ipfs-Hash');
						console.log("added page:" + hash)
						cb(hash)
					})
				})
			} else {
				// no new css. Just call cb
				console.log("added page: " + hash)
				cb(hash)
			} 
		})
	})
}


function getMyChild(j, parent, childno, id) {
  j.getchild(parent, childno, function(err, res) {
    var el = document.getElementById(id);
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
	j.addPage( hash, parent, child, function(err, res){
		// leave these logs for now for debugging
		if (err) {
			console.log("addPage errored")
			console.log(err)
		} else {
			console.log("addPage message sent!")
			console.log("transcation hash:")
			console.log(res)
		}
	})
}

function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}


function initNavBar() {
	document.getElementById('nav_contractAddress').innerText = contractAddress;
	document.getElementById('nav_pageAddress').innerText = sel;
	document.getElementById('nav_parentAddress').innerText = parent || 'orphan';
}