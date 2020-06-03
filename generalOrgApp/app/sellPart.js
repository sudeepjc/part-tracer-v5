const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const { FileSystemWallet, Gateway } = require('fabric-network');

async function sellPart(userName,args) {

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(__dirname, `../identity/user/${userName}/wallet`);
    console.log(`walletPath: ${walletPath}`);
    const wallet = new FileSystemWallet(walletPath);

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    try {

        // Load connection profile; will be used to locate a gateway
        const userOrg = 'general';
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

        // Get addressability to partTracer contract
        console.log('Use org.partTracer.partTrade smart contract.');

        const contract = await network.getContract('partTracer');

        // sell the Part
        console.log('Submit partTrade sellPart transaction.');

        // create the transaction
        let sellResponse = await contract.submitTransaction('sellPart',args[0],args[1],args[2]);

        // process response
        console.log('Process addPart transaction response.'+sellResponse);

        let partDetails = sellResponse.toString();

        console.log(`Part ${partDetails} was sold successfully`);
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

let partDetails = [process.argv[2],'AirbusMSP','190865']

sellPart('user1',partDetails);