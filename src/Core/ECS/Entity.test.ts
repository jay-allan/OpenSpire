import { Component } from './Component';
import { ECS } from './ECS';

let ecs: ECS;

class TestComponent extends Component {
    readonly type: string = 'TestComponent';
}

beforeEach(() => {
    ecs = new ECS();
});

afterEach(() => {
    ecs.destroy();
});

test('Entity ID increments with each entity created', () => {
    const e1 = ecs.createEntity();
    const e2 = ecs.createEntity();
    expect(e2.id).toBeGreaterThan(e1.id);
});

test('Entity components are added', () => {
    const e = ecs.createEntity();
    const c = ecs.createComponent(e, TestComponent);
    expect(c).toBeDefined();
    expect(ecs.getEntityComponent(e.id, TestComponent)).toBe(c);
});

test('Same component cannot be added to Entity multiple times', () => {
    const e = ecs.createEntity();
    const c1 = ecs.createComponent(e, TestComponent);
    const c2 = ecs.createComponent(e, TestComponent);
    expect(c2).toBeUndefined();
    expect(ecs.getEntityComponent(e.id, TestComponent)).toBe(c1);
});
