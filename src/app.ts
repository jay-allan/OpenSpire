import { Battle } from './Battle/Battle';

(async () => {
    const battle = new Battle();
    await battle.start();
    // The battle is over. Destroy stdin so Inquirer's readline interface
    // releases its hold on the event loop and the process exits cleanly.
    process.stdin.destroy();
})();
