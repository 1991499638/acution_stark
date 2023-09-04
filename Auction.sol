pragma solidity ^0.4.25;

contract Auction{
// *********实验环境下合约变量类型均使用public，实用环境请谨慎参考   
// addresses of stakeholders involved in the reverse_auction    
    address public auctioneer = 0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c; //default auctioneer address
    address [] public bidders;
    address [] public qualified_bidders;
    address public winning_bidder;
    
//attributes needed @ pre-auction stage
    bytes32 public product_description;  
    bytes32 public technical_specification;  
    uint public highest_bid;
    uint public V = 100; //default value is 100
    uint public auction_duration;//**
    uint public fairnessFees;

// different states duirng the auction process
    bool public auctioneer_specification = false; 
    // bool public bidder_participate = false;
    bool public bidder_qualified = false;
    bool public bidder_win = false;
    bool public withdrawLock = false;
    bool public testing = false;

// attributes needed during auctioneer evaluation stage
    struct bidder_evaluation{
    bytes32 RFI_form; //Request for Information (RFI) hash file
    bytes32 RFP_form; //Request for Proposal (RFP) hash file
    bytes32 RFQ_form; //Request for Quotation (RFQ) hash file
    }

    mapping (address => bidder_evaluation) public bidder_details;

    uint public maxBiddersCount;//最大投标人数
    uint public total_bidders =0;
    // uint public total_qualified_bidders =0;

// variables needed during the live action process

    struct bids{
        string cipher; //bid + r + commit
        bool existing;
        bool qualified;
        bool paidBack;
    }
    mapping (address => bids) public Bids;
    address[] public indexs;//定义一个地址数组


// restriction during auction
    modifier onlyauctioneer(){
        require (msg.sender == auctioneer, "Only auctioneer can call this function");
        _;
    }    

// bidFees = 1;  0x5a64c5a9743a4d7b346c55d4250716bba6c27a19d3785e5f7641b9c1d7b4d7f7
    constructor (bytes32 _product_description, bytes32 _technical_specification, uint _maxBiddersCount, uint _fairnessFees, bool _testing) public payable {
        // require(msg.value >= _fairnessFees || testing, "账户余额不足");
        auctioneer = msg.sender;
        //不同阶段的区块时间
        product_description = _product_description;
        technical_specification = _technical_specification;
        //setup auction parameters
        maxBiddersCount = _maxBiddersCount;
        fairnessFees = _fairnessFees * 1000000000000000000;//以ETH为单位
        testing = _testing;
        //auctioneer specification success
        auctioneer_specification = true;
    }

// 密文需要后端使用RSA加密;0xfffe0102030405060708fffe0102030405060708fffe
// 返回值即为bidder编号
    function Bid(string cipher, bool pVerify) public payable returns (uint){
        require(indexs.length < maxBiddersCount, "投标成员人数已满"); //available slot    
        require(msg.value >= fairnessFees, "账户余额不足以支付押金");  //paying fees
        require(msg.sender != auctioneer, "auctioneer不得进行投标");
        require(!bidder_win, "投标时间已过，已决出胜者");
        require(Bids[msg.sender].existing == false, "账户已投标"); //first bid
        require(pVerify, "承诺验证不成功");
        total_bidders++;
        Bids[msg.sender] = bids(cipher, true, false || testing, false); //测试环境默认所有bidders资格审查都是合格的
        indexs.push(msg.sender);
        return indexs.length;
    }

//************* the partie default passes all ************************************
// seller participation stage: sellers participate in the evaluation stage
    // function bidder_participation (bytes32 _RFI_form,bytes32 _RFP_form, bytes32 _RFQ_form) public{
     
    //  require (auctioneer_specification);
    //  require(Bids[msg.sender].existing == true, "the bidder must existing! ");
     
    //  bidder_details[msg.sender].RFI_form = _RFI_form;
    //  bidder_details[msg.sender].RFP_form = _RFP_form;
    //  bidder_details[msg.sender].RFQ_form = _RFQ_form;

    //  bidder_participate = true; 
    // }

// auctioneer check bidder_details of every bidder and select qualified bidders
    // function getBidder_details(address _address) external view onlyauctioneer returns (bytes32, bytes32, bytes32) {
    //     bidder_evaluation storage evaluation = bidder_details[_address];
    //     return (evaluation.RFI_form, evaluation.RFP_form, evaluation.RFQ_form);
    // }

    // function select_bidders(address _address) external onlyauctioneer {

    //     require(bidder_participate);
    //     bidder_qualified = true;
    //     require(Bids[msg.sender].existing == true, "the bidder must existing! ");
    //     Bids[_address].qualified = true;
    //     total_qualified_bidders++;
    // }
//************* the partie default passes all ************************************

    function ClaimWinner(address _winner, uint _bid, bool pVerify) public onlyauctioneer {
        require(bidder_qualified || testing);
        require(Bids[_winner].existing == true, "账户不存在"); //existing bidder
        require(Bids[_winner].qualified == true, "winner未通过资格审查");
        require(_bid < V, "投标金额超过最大值"); //valid bid, V is the upper bound
        require(pVerify, "承诺验证不成功"); //valid open of winner's commit        
        winning_bidder = _winner;
        highest_bid = _bid * 1000000000000000000;//以ETH为单位
        bidder_win = true;
        withdrawLock = true;
    }

    function Withdraw() public payable {
        require(msg.sender != winning_bidder, "账户为winning_bidderr账户");
        require(Bids[msg.sender].paidBack == false && Bids[msg.sender].existing == true, "账户金额已退还或账户不存在");
        require(withdrawLock, "还未到退还时间");
        msg.sender.transfer(fairnessFees);
        Bids[msg.sender].paidBack = true;
    }

    function WinnerPay() public payable {
        require(bidder_win, "未到投标者胜利时期");
        require(msg.sender == winning_bidder, "当前账户非获胜账户");
        require(msg.value >= highest_bid - fairnessFees, "账户余额不足已支付获胜价格");
        bidder_win = false;
    }

    function Destroy() public onlyauctioneer {
        selfdestruct(auctioneer);
    }
}

    