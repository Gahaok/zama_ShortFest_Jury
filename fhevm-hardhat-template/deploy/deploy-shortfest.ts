import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployed = await deploy("ShortFestJury", {
    from: deployer,
    log: true,
  });

  console.log(`ShortFestJury contract deployed at: ${deployed.address}`);
};

export default func;
func.id = "deploy_shortfest_jury";
func.tags = ["ShortFestJury"];


