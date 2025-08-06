module counter::counter {


    // Add `store` ability
    public struct Counter has key, store {
        id: UID,
        owner: address,
        value: u64,
    }

    // Create a new shared Counter object
     entry fun create(ctx: &mut TxContext) {
        let counter = Counter {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            value: 0,
        };
        transfer::share_object(counter);
    }

    // Increment counter
     public fun increment(counter: &mut Counter) {
        counter.value = counter.value + 1;
    }

    // Decrement counter
     public fun decrement(counter: &mut Counter) {
        assert!(counter.value > 0, 1);
        counter.value = counter.value - 1;
    }

    // Reset counter
     public fun reset(counter: &mut Counter, value: u64, ctx: &TxContext) {
        assert!(counter.owner == tx_context::sender(ctx), 0);
        counter.value = value;
    }

    // Read-only function to get value
    public fun get_value(counter: &Counter): u64 {
        counter.value
    }
}
