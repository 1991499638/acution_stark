pragma solidity ^0.4.25;

contract Auction{
// *********实验环境下合约变量类型均使用public，真实环境请谨慎参考   
// addresses of stakeholders involved in the reverse_auction    
    address public auctioneer = 0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c; //default auctioneer address
    address [] public bidders;
    address public winning_bidder;
    
//attributes needed @ pre-auction stage
    bytes32 public product_description;     //拍卖物相关资料
    bytes32 public technical_specification;  
    uint public highest_bid;
    uint public V = 100; //设置默认投标上限
    uint public fairnessFees;          //押金


// 拍卖过程中的不同状态
    bool public auctioneer_specification = false; 
    bool public bidder_qualified = false;
    bool startBid = false;
    bool bidder_win = false;
    bool withdrawLock = false;
    bool testing = false;
    bool winner_cipher = false;

// 拍卖过程中的不同阶段时间安排
    uint init;
    uint submit;
    uint verify;
    uint winner_pay;
    uint destroy;

// 参与方需要提交的一系列资格证明，将由拍卖方审查
    struct bidder_evaluation{
    bytes32 RFI_form; //Request for Information (RFI) hash file
    bytes32 RFQ_form; //Request for Quotation (RFQ) hash file
    //....
    }

    mapping (address => bidder_evaluation) public bidder_details;

    uint public maxBiddersCount;//最大投标人数
    uint public total_bidders =0;


// variables needed during the live action process

    struct bids{
        string cipher; //bid + r + commit
        bytes32 proof;
        bool existing;
        bool paidBack;
    }
    mapping (address => bids) public Bids;
    address[] indexs;//定义一个地址数组
    address[] bidsQualified;
    uint total_qualified_bidders = 0;

// restriction during auction
    modifier onlyauctioneer(){
        require (msg.sender == auctioneer, "Only auctioneer can call this function");
        _;
    }    

// bidFees = 1;  0x5a64c5a9743a4d7b346c55d4250716bba6c27a19d3785e5f7641b9c1d7b4d7f7
    constructor (uint _init, uint _submit, uint _verify, uint _winner_pay, uint _destroy ,bytes32 _product_description, bytes32 _technical_specification, uint _maxBiddersCount, uint _fairnessFees, bool _testing) public payable {
        // require(msg.value >= _fairnessFees || testing, "账户余额不足");
        auctioneer = msg.sender;
        //不同阶段的区块时间
        init = block.number + _init;
        submit = init + _submit;
        verify = submit + _verify;
        winner_pay = verify + _winner_pay;
        destroy = winner_pay + _destroy;
        // 拍卖品相关文件hash、拍卖方资格文件hash
        product_description = _product_description;
        technical_specification = _technical_specification;
        //setup auction parameters
        maxBiddersCount = _maxBiddersCount;
        fairnessFees = _fairnessFees * 1000000000000000;//以Finney为单位
        testing = _testing;
        //auctioneer specification success
        auctioneer_specification = true;
    }

    // 准备阶段, 在此阶段还需要包含“注册”功能, 筛选出合格的用户
//************* the partie default passes all ************************************
    // 参与者提交一系列资格证明文件的hash值，提交的信息只能由
    function bidder_participation (bytes32 _RFI_form, bytes32 _RFQ_form) public{
     require (auctioneer_specification);
     require(Bids[msg.sender].existing == true, "the bidder must existing! ");
     bidder_details[msg.sender].RFI_form = _RFI_form;
     bidder_details[msg.sender].RFQ_form = _RFQ_form;
    }

    // auctioneer check bidder_details of every bidder and select qualified bidders
    function getBidder_details(address _address) external view onlyauctioneer returns (bytes32, bytes32) {
        bidder_evaluation storage evaluation = bidder_details[_address];
        return (evaluation.RFI_form,  evaluation.RFQ_form);
    }

    function select_bidders(address _address) external onlyauctioneer {
        bidder_qualified = true;
        require(block.number < init, "准备时间已过");
        bidsQualified.push(_address);
        total_qualified_bidders++;
    }

    function existBids(address _address) internal view returns (bool){
         for (uint i = 0; i < bidsQualified.length; i++) {
            if (bidsQualified[i] == _address) {
                return true;
            }
        }
        return false;
    }
//************* the partie default passes all ************************************

    // 开始投标
    // 密文需要后端使用RSA加密;0xfffe0102030405060708fffe0102030405060708fffe
    // 返回值即为bidder编号
    function Bid(string cipher, bytes32 proof, bool pVerify) public payable returns (uint){
        require(existBids(msg.sender) || testing, "用户不满足资格");
        require(indexs.length < maxBiddersCount, "投标成员人数已满"); //available slot    
        require(msg.value >= fairnessFees, "账户余额不足以支付押金");  //paying fees
        require(msg.sender != auctioneer, "auctioneer不得进行投标");
        require((block.number<submit && block.number>init) || testing, "不在投标时间段内");
        require(Bids[msg.sender].existing == false, "账户已投标"); //first bid
        require(pVerify, "承诺验证不成功");
        total_bidders++;
        Bids[msg.sender] = bids(cipher, proof, true, false); 
        indexs.push(msg.sender);
        return indexs.length;
    }

    // 决出获胜者
    function ClaimWinner(address _winner, uint _bid, bool pVerify) public onlyauctioneer {
        require((block.number<verify && block.number>submit) || testing, "不在决出获胜者时间段内");
        require(bidder_qualified || testing);
        require(Bids[_winner].existing == true, "账户不存在"); //existing bidder
        // require(Bids[_winner].qualified == true, "winner未通过资格审查");
        require(_bid < V, "投标金额超过最大值"); //valid bid, V is the upper bound
        require(pVerify, "承诺验证不成功"); //valid open of winner's commit        
        winning_bidder = _winner;
        // winner_cipher = Bids[winning_bidder].cipher;
        highest_bid = _bid * 1000000000000000;//以为单位
        bidder_win = true;
    }

    function getBid() public view returns (string, bytes32){
        return (Bids[msg.sender].cipher, Bids[msg.sender].proof);
    } 

    // 揭示投标   
    function Reveal() external view returns (uint, string, bytes32) {
        require(bidder_win, "获胜者还未决出");
        require((block.number<verify && block.number>submit) || testing, "并未处于揭示投标时间段");
        return (highest_bid, Bids[winning_bidder].cipher, Bids[winning_bidder].proof);
    } 
    
    // 验证投标，给后端提供信息接口
    // 在后端进行验证, 测试环境下并没有设计验证失败的情况
    function Verify(bool proofVerify, string _cipher) external {
        require(proofVerify, "证明验证未通过");
        require(keccak256(abi.encodePacked(_cipher)) == keccak256(abi.encodePacked(Bids[winning_bidder].cipher)), "承诺验证未通过");
        winner_cipher = true;
    }

    // 获胜者支付出价
    function WinnerPay() public payable {
        require(bidder_win && (block.number < winner_pay && block.number > verify) || testing, "未到投标者胜利时期");
        require(winner_cipher, "胜利者验证失败");
        require(msg.sender == winning_bidder, "当前账户非获胜账户");
        require(msg.value >= highest_bid - fairnessFees, "账户余额不足已支付获胜价格");
        bidder_win = false;
        withdrawLock = true;
    }

    // 退还押金
    function Withdraw() public {
        require(msg.sender != winning_bidder, "账户为winning_bidderr账户");
        require(Bids[msg.sender].paidBack == false && Bids[msg.sender].existing == true, "账户金额已退还或账户不存在");
        require(withdrawLock || block.number > winner_pay || testing, "还未到退还时间");
        msg.sender.transfer(fairnessFees);
        Bids[msg.sender].paidBack = true;
    }

    // 摧毁合约，将所有钱转回拍卖者
    function Destroy() public onlyauctioneer {
        require(block.number > destroy || testing, "此时还不能摧毁合约");  // 避免拍卖方提前摧毁合约捞钱
        selfdestruct(auctioneer);
    }
}

contract Live is Auction {
    constructor() public Auction(1, 1, 1, 1, 1, 0x5a64c5a9743a4d7b346c55d4250716bba6c27a19d3785e5f7641b9c1d7b4d7f7, 0x5a64c5a9743a4d7b346c55d4250716bba6c27a19d3785e5f7641b9c1d7b4d7f7, 100, 1, true){
        
    }
}