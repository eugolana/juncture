var ipfsUrl = "http://127.0.0.1:8080/ipfs/";
var emptyDir = "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn";
var	editableElements = ['main','title', 'childA', 'childB'];
var sel = "";
// sel (this pages hash) and j (th contract instance) are in global scope
var j;
var editMode = true;

var qs = parseQuery(window.location.search)

window.onload = function() {
	// check if we are in edit mode.
	if (qs && qs['edit']) {
		// if so add edit buttons
		addEditButtons(editableElements);
		clearFields(editableElements)
		addSaveButton();
	}
	// init web3

    var Juncture = web3.eth.contract(abi);
	j = Juncture.at(contractAddress);
	console.log(j)

	var getSelf = new Promise( (resolve, reject) => {
	  if (parent && parent != "0x") {
	    j.getchild(parent, child, function(err, res) {
	      if (err) {
	      	console.log("error gtting child")
	      	console.log(err)
	        reject(err)
	      } else {
	        if (res[0] && res[1] != "0x") {
	          sel = res[1];
	        } else {
	          console.log("someting wrong getting sel")
	        }
	        resolve()
	      }
	    })
	  } else {
	    // if it doesnt have a parent then ssume it is the origin
	    j.startNode(function(err, res) {
	      if (err) {
	        console.log('error getting startNode')
	        console.log(err)
	        reject(err)
	      } else {
	        sel = res;
	        resolve()
	      }
	    })
	  }
	})

    getSelf.then(function() {
	    getMyChild(j, sel, 0, 'childA');
	    getMyChild(j, sel, 1, 'childB');
	  })
    // edit page title with 'title' element
    document.getElementById('title').onchange = function(e) {
    	console.log('title canges')
    	document.title = this.innerText + ' - Juncture';
    }

    // enter view mode if 'space' is pressed
    document.addEventListener('keydown', (event) => {
    	const keyName = event.key;
    	if (! editMode) {
    		return;
    	}
    	editMode = false;
    	// console.log("key: " + keyName)
    	for (var i=0; i < editableElements.length; i++) {
    		if (document.getElementById(editableElements[i]).contentEditable == 'true') {
    			return
    		}
    	}
  		if (keyName == ' ') {
  			removeEditButtons(editableElements);
  		}
	});
    document.addEventListener('keyup', (event) => {
    	const keyName = event.key;
    	editMode = true;
    	for (var i=0; i < editableElements.length; i++) {
    		if (document.getElementById(editableElements[i]).contentEditable == 'true') {
    			console.log('editable element: ' + editableElements[i])
    			return
    		}
    	}
  		if (keyName == ' ') {
  			addEditButtons(editableElements);
  			addSaveButton();
  		}
	});

}

function addEditButtons(_editableElements) {
	for (var i = 0; i < _editableElements.length; i++) {
		addEditButton(_editableElements[i]);
	}
}

function addEditButton(id) {
	let el = document.getElementById(id);
	let parent = el.parentElement;
	let input = document.createElement('input');
	input.type = 'button';
	input.id = "edit_" + id;
	input.onclick = function(event) {
		toggleEditable(id, event);
	}
	input.value = "edit " + id;
	parent.insertBefore(input, el.nextSibling);
}


function addSaveButton() {
	let page = document.getElementById('page');
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

function removeEditButtons(_editableElements){
	for (var i = 0; i < _editableElements.length; i++) {
		document.getElementById("edit_" + _editableElements[i]).remove();
		document.getElementById(_editableElements[i]).contentEditable = 'false';
	}
	document.getElementById('save').remove()
}

function clearFields(_editableElements) {
	for (var i = 0; i < _editableElements.length; i++) {
		document.getElementById(_editableElements[i]).innerText = "";
	}
}


function saveSnapshot() {
	removeEditButtons(editableElements);
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

	// replace 'var child'
	let childStart = f.search("var child")
	let childEnd = childStart + f.slice(childStart).search(';')
	f = f.slice(0,childStart) + "var child = " + qs['child'] + f.slice(childEnd);	

	addEditButtons(editableElements);
	addSaveButton();
	return f;
}


function toggleEditable(id, event) {
	let element = document.getElementById(id);
	if (element.contentEditable == 'true') {
		element.contentEditable = 'false';
		event.target.value = 'edit ' + id;
		// broadcast event
		if (element.onchange) {
			element.onchange();
		}
	} else {
		element.contentEditable = 'true';
		event.target.value = 'done editing ' + id;	
	}
}

function upload(f, cb) {
	fetch(ipfsUrl + hashFolder + "index.html", {
		method: 'PUT',
		body: f,
	}).then(function(response) {
		var hash = response.headers.get('Ipfs-Hash')
		console.log(hash)
		cb(hash)
	})
}


function getMyChild(j, parent, childno, id) {
  console.log("in get my child")
  j.getchild(parent, childno, function(err, res) {
    var el = document.getElementById(id);
    if (err) {
      el.innerText = err;
    } else {
      if (res[0] && res[1]) {
        el.href = ipfsUrl +res[1];
      } else {
        el.href = "?edit=true&child=" + childno;
      }
    }
  })
}

function addPage(j, hash, parent, child) {
	j.addPage( hash, parent, child, function(err, res){
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