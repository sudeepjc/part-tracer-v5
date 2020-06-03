const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const { FileSystemWallet, Gateway } = require('fabric-network');

async function queryPart(userName,args) {

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(__dirname, `../identity/user/${userName}/wallet`);
    console.log(`walletPath: ${walletPath}`);
    const wallet = new FileSystemWallet(walletPath);

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    try {

        // Load connection profile; will be used to locate a gateway
        const userOrg = 'airbus';
        let orgDomain = `${userOrg}.parttracer.com`;
        let connectionFile = `connection-${userOrg}.yaml`;
        let connectionProfilePath = path.join(__dirname ,'../../organizations/peerOrganizations',orgDomain,connectionFile);

        console.log(`connectionProfilePath: ${connectionProfilePath}`);
        let connectionProfile = yaml.safeLoad(fs.readFileSync(connectionProfilePath, 'utf8'));
        console.log(`connectionProfile: ${connectionProfile}`);

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled:true, asLocalhost: true }
        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access myChannel network
        console.log('Use network channel: mychannel.');

        const network = await gateway.getNetwork('mychannel');

        console.log('Use org.partTracer.partTrade smart contract.');

        const contract = await network.getContract('partTracer');

        // queryPart
        console.log('evaluate partTrade queryPart query.');

        let queryResponse;

        switch(args.length){
            case 2:
                queryResponse = await contract.evaluateTransaction(args[0], args[1]);
                break;
            case 3:
                queryResponse = await contract.evaluateTransaction(args[0], args[1],args[2]);
                break;
            case 5:
                queryResponse = await contract.evaluateTransaction(args[0], args[1],args[2],args[3],args[4]);
                break;
            default:
                console.log(`Error with query ${args}`);
        }

        if(!queryResponse){
            return;
            // Sudeep: throw error here instead
        }

        // process response
        console.log('Process queryPart transaction response.'+queryResponse);

        let response = queryResponse.toString();

        console.log(`Part ${response} was queried successfully`);
        console.log('Transaction complete.');

    } catch (error) {

        if(error.endorsements && error.endorsements.length > 0){
            console.log(`Error processing transaction. ${error.endorsements[0]}`);
        }

        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);

    } finally {

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();

    }
}

let queryArgs = ['queryPart','engine_1'];

// queryArgs = ['queryPart','engine_2'];

// queryArgs = ['queryParts','engine_2','engine_7'];

// queryArgs = ["queryPartsWithPagination","","","3","engine_2"];

// queryArgs = ['getPartHistory','engine_1'];

// queryArgs = ["getRichQueryResult","{\"selector\":{\"docType\":\"Part\",\"owner\":\"GeneralMSP\"}}"];

queryPart('user1',queryArgs);
