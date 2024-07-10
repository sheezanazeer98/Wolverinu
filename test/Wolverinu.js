const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Wolverinu", function () {
    let Wolverinu, wolverinu, owner, addr1, addr2, addrs;

    beforeEach(async function () {
        Wolverinu = await ethers.getContractFactory("Wolverinu");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        wolverinu = await Wolverinu.deploy();
        await wolverinu.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await wolverinu.owner()).to.equal(owner.address);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const ownerBalance = await wolverinu.balanceOf(owner.address);
            expect(await wolverinu.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
            // Transfer 50 tokens from owner to addr1
            await wolverinu.transfer(addr1.address, 50);
            const addr1Balance = await wolverinu.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(50);

            // Transfer 50 tokens from addr1 to addr2
            await wolverinu.connect(addr1).transfer(addr2.address, 50);
            const addr2Balance = await wolverinu.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });

        it("Should fail if sender doesn’t have enough tokens", async function () {
            const initialOwnerBalance = await wolverinu.balanceOf(owner.address);

            // Try to send 1 token from addr1 (0 tokens) to owner.
            await expect(
                wolverinu.connect(addr1).transfer(owner.address, 1)
            ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

            // Owner balance shouldn't have changed.
            expect(await wolverinu.balanceOf(owner.address)).to.equal(
                initialOwnerBalance
            );
        });

        it("Should update balances after transfers", async function () {
            const initialOwnerBalance = await wolverinu.balanceOf(owner.address);

            // Transfer 100 tokens from owner to addr1.
            await wolverinu.transfer(addr1.address, 100);

            // Transfer another 50 tokens from owner to addr2.
            await wolverinu.transfer(addr2.address, 50);

            // Check balances.
            const finalOwnerBalance = await wolverinu.balanceOf(owner.address);
            expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

            const addr1Balance = await wolverinu.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(100);

            const addr2Balance = await wolverinu.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });
    });

    describe("Approval", function () {
        it("Should approve tokens for delegated transfer", async function () {
            await wolverinu.approve(addr1.address, 100);
            expect(await wolverinu.allowance(owner.address, addr1.address)).to.equal(100);
        });

        it("Should allow spender to transfer tokens", async function () {
            await wolverinu.approve(addr1.address, 100);
            await wolverinu.connect(addr1).transferFrom(owner.address, addr2.address, 100);
            expect(await wolverinu.balanceOf(addr2.address)).to.equal(100);
        });

        it("Should fail if spender doesn’t have enough allowance", async function () {
            await wolverinu.approve(addr1.address, 50);
            await expect(
                wolverinu.connect(addr1).transferFrom(owner.address, addr2.address, 100)
            ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
        });
    });

    describe("Ownership", function () {
        it("Should transfer ownership", async function () {
            await wolverinu.transferOwnership(addr1.address);
            expect(await wolverinu.owner()).to.equal(addr1.address);
        });

        it("Should renounce ownership", async function () {
            await wolverinu.renounceOwnership();
            expect(await wolverinu.owner()).to.equal(ethers.constants.AddressZero);
        });
    });
});
