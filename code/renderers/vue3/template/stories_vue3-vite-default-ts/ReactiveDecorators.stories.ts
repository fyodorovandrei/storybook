import { global as globalThis } from '@storybook/global';
import { userEvent, within } from '@storybook/testing-library';
import type { Meta, StoryObj } from '@storybook/vue3';
import { h } from 'vue';
import { RESET_STORY_ARGS, STORY_ARGS_UPDATED, UPDATE_STORY_ARGS } from '@storybook/core-events';
import Reactivity from './Reactivity.vue';

const meta = {
  component: Reactivity,
  argTypes: {
    header: { control: { type: 'text' } },
    footer: { control: { type: 'text' } },
    default: { control: { type: 'text' } },
  },
  args: {
    label: 'initial label',
    default: 'initial default slot.',
    header: 'initial header slot', // this can be useless if you have custom render function that overrides the slot
    footer: 'initial footer slot.',
  },
  play: async ({ canvasElement, id, args }) => {
    const channel = (globalThis as any).__STORYBOOK_ADDONS_CHANNEL__;

    const canvas = within(canvasElement);

    await channel.emit(RESET_STORY_ARGS, { storyId: id });
    await new Promise((resolve) => channel.once(STORY_ARGS_UPDATED, resolve));

    const input = await canvas.findByLabelText<HTMLInputElement>('Some input:');
    await userEvent.type(input, 'value');

    await channel.emit(UPDATE_STORY_ARGS, {
      storyId: id,
      updatedArgs: {
        label: 'updated label',
        header: 'updated header slot', // this can be useless if you have custom render function that overrides the slot which the case here
        footer: 'updated footer slot',
        default: 'updated default slot',
      },
    });
    await new Promise((resolve) => channel.once(STORY_ARGS_UPDATED, resolve));
  },
} satisfies Meta<typeof Reactivity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoDecorators: Story = {};

export const DecoratorFunctionalComponent: Story = {
  decorators: [
    (storyFn, context) => {
      const story = storyFn();
      return () => {
        return h('div', { style: 'border: 5px solid red' }, h(story));
      };
    },
  ],
};

export const DecoratorFunctionalComponentArgsFromContext: Story = {
  decorators: [
    (storyFn, context) => {
      const story = storyFn();

      return () => {
        return h('div', { style: 'border: 5px solid blue' }, h(story, context.args));
      };
    },
  ],
};

export const DecoratorComponentOptions: Story = {
  decorators: [
    (storyFn, context) => {
      return {
        components: { story: storyFn() },
        template: `<div :style="{ border: '5px solid red' }" ><story/></div>`,
      };
    },
  ],
};

export const DecoratorComponentOptionsArgsFromData: Story = {
  decorators: [
    (storyFn, context) => {
      return {
        components: { story: storyFn() },
        data: () => ({ args: context.args }),
        template: `<div :style="{ border: '5px solid blue' }" ><story/></div>`,
      };
    },
  ],
};
