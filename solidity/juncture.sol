pragma solidity ^0.4.17;

contract Juncture {
    // To be set by creator
    address public creator;
    string public startNode;
    uint public deposit;
    
    // Page State
    // not required till 'remove' function added
    
    struct Page {
        address author;
        string pageAddress;
        string parentAddress;
        string childA;
        string childB;
    }
    
    mapping (string => Page) pages;
    string[] public pageList;
    
    modifier containsDeposit() {
        if (msg.value < deposit) {
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
    
    function init(string _startNode) public {
        if ( msg.sender != creator) {
            LogShitGoneWrong("only creator can initialise");
        } else {
            startNode = _startNode;
            pages[startNode] = Page({
                author: msg.sender,
                pageAddress: startNode,
                parentAddress: "",
                childA: "",
                childB: ""
            });
        pageList.push(startNode);
        }
    }
    
    function addPage(string _pageAddress, string _parentAddress, uint8 child) 
    public 
    payable // this bastard right here
    containsDeposit
    returns (uint) {
        
        // Check parent exists
        var parent = pages[_parentAddress];
        bytes memory bytesPageParent = bytes(parent.pageAddress);
        if ( bytesPageParent.length == 0) {
            LogShitGoneWrong("parent doesn't exist");
            // return 0 for error
            return 0;
        }
        // send dolla to parent and parents parent
        parent.author.transfer(msg.value/2);
        var grandparent = pages[parent.parentAddress];
        if (bytes(grandparent.parentAddress).length != 0) {
            grandparent.author.transfer(msg.value/4);
        }
        
        // Check this page doesnt already exist (probably not necessary.. except
        // to revent accidenta double)
        bytes memory bytesPage = bytes(pages[_pageAddress].pageAddress);
        if (bytesPage.length != 0) {
            LogShitGoneWrong("that hash aleady exists");
            return 0;
        }
        
        // check which child we are adding
        // 0: childA, 1: childB, other=freepage
        if (child == 0) {
            if ( bytes(pages[_parentAddress].childA).length != 0) {
                LogShitGoneWrong("childA already exists");
                return 0;
            }
            pages[_parentAddress].childA = _pageAddress;
        }
        if (child == 1) {
            if ( bytes(pages[_parentAddress].childB).length != 0) {
                LogShitGoneWrong("childB already exists");
                return 0;
            }
            pages[_parentAddress].childB = _pageAddress;
        }
        // return total number of pages
        pages[_pageAddress] = Page({ author: msg.sender, pageAddress: _pageAddress, parentAddress: _parentAddress, childA: "", childB: "" });
        var n = pageList.push(_pageAddress);
        return n;
    }
    
    function getPageAtIndex(uint n) public view returns ( string pageAddress) {
        return  pages[pageList[n]].pageAddress;
    }
    
    function getchild(string _parentAddress, uint child) public view returns (bool err, string childAddress) {
        var parentAddress = _parentAddress;
        if (child == 0) {
            if (bytes(pages[parentAddress].childA).length > 0) {
                return (true, pages[parentAddress].childA);
            }
        }
        if (child == 1) {
            if (bytes(pages[parentAddress].childA).length > 0) {
                return (true, pages[parentAddress].childB);
            }
        }
        return (false, "");
    }
    
    function getParent(string _childAddress) public view returns (string) {
        return pages[_childAddress].parentAddress;
    }
    
}
