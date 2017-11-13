pragma solidity ^0.4.7;

contract Juncture {
    // To be set by creator
    address public creator;
    bytes public startNode;
    uint public deposit;
    
    // Page State
    // not required till 'remove' function added
    
    struct Page {
        address author;
        bytes pageAddress;
        bytes parentAddress;
        bytes childA;
        bytes childB;
    }
    
    mapping (string => Page) pages;
    bytes[] public pageList;
    
    modifier containsDeposit() {
        if (msg.value < deposit) {
            LogEverything("deposit too low");
            revert();
        } else {
            _;
        }
    }
    event LogEverything(string message);
    event LogShitGoneWrong(string message);
    
    function Juncture( uint _deposit) public {
        creator = msg.sender;
        deposit = _deposit;
        
    }
    
    function init(bytes _startNode) public {
        if ( msg.sender != creator) {
            LogShitGoneWrong("only creator can initialise");
        } else {
            startNode = _startNode;
            pages[string(startNode)] = Page({
                author: msg.sender,
                pageAddress: startNode,
                parentAddress: "",
                childA: "",
                childB: ""
            });
        pageList.push(startNode);
        }
    }
    
    function addPage(bytes _pageAddress, bytes _parentAddress, uint8 child) 
    public 
    payable // this bastard right here
    returns (uint) {
        LogEverything("Made it past modifier");
        
        if (msg.value < deposit) {
            LogEverything("deposit too low");
            return 0;
        }
        // Check parent exists
        var parent = pages[string(_parentAddress)];
        bytes memory bytesPageParent = bytes(parent.pageAddress);
        if ( bytesPageParent.length == 0) {
            LogShitGoneWrong("parent doesn't exist");
            // return 0 for error
            return 0;
        }
        // send dolla to parent and parents parent
        parent.author.transfer(msg.value/2);
        var grandparent = pages[string(parent.parentAddress)];
        if (grandparent.parentAddress.length != 0) {
            grandparent.author.transfer(msg.value/4);
        }
        
        // Check this page doesnt already exist (probably not necessary.. except
        // to revent accidenta double)
        bytes memory bytesPage = bytes(pages[string(_pageAddress)].pageAddress);
        if (bytesPage.length != 0) {
            LogShitGoneWrong("that hash aleady exists");
            return 0;
        }
        
        // check which child we are adding
        // 0: childA, 1: childB, other=freepage
        if (child == 0) {
            if ( pages[string(_parentAddress)].childA.length != 0) {
                LogShitGoneWrong("childA already exists");
                return 0;
            }
            pages[string(_parentAddress)].childA = _pageAddress;
        }
        if (child == 1) {
            if ( pages[string(_parentAddress)].childB.length != 0) {
                LogShitGoneWrong("childB already exists");
                return 0;
            }
            pages[string(_parentAddress)].childB = _pageAddress;
        }
        // return total number of pages
        pages[string(_pageAddress)] = Page({ author: msg.sender, pageAddress: _pageAddress, parentAddress: _parentAddress, childA: "", childB: "" });
        var n = pageList.push(_pageAddress);
        return n;
    }
    
    function getPage(bytes _pageAddress) public view returns (address, bytes) {
        var page = pages[string(_pageAddress)];
        return (page.author, page.pageAddress);
        
    }
    
    function getPageAtIndex(uint n) public view returns ( bytes pageAddress) {
        return  pages[string(pageList[n])].pageAddress;
        // return msg.sender;
    }
    
    function getchild(bytes _parentAddress, uint child) public view returns (bool err, string childAddress) {
        var parentAddress = string(_parentAddress);
        if (child == 0) {
            if (pages[parentAddress].childA.length > 0) {
                return (true, string(pages[parentAddress].childA));
            }
        }
        if (child == 1) {
            if (pages[parentAddress].childA.length > 0) {
                return (true, string(pages[parentAddress].childB));
            }
        }
        return (false, "");
    }
    
    function getParent(bytes _childAddress) public view returns (bytes ) {
        return pages[string(_childAddress)].parentAddress;
    }
    
    function getDeposit() public view returns ( uint _deposit ){
        return deposit;
    }
    
}
