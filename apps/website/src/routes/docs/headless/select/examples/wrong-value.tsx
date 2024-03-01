import { component$, useSignal, useStyles$ } from '@builder.io/qwik';
import styles from './select.css?inline';
import {
  Select,
  SelectListbox,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from '@qwik-ui/headless';

export default component$(() => {
  useStyles$(styles);
  const usersSig = useSignal<string[]>(['Tim', 'Ryan', 'Jim', 'Jessie', 'Abby']);

  return (
    <>
      <Select value="Jessi" class="select">
        <SelectTrigger class="select-trigger">
          <SelectValue placeholder="wrong value placeholder" />
        </SelectTrigger>
        <SelectListbox class="select-listbox">
          {usersSig.value.map((user) => (
            <SelectOption class="select-option" key={user}>
              {user}
            </SelectOption>
          ))}
        </SelectListbox>
      </Select>
    </>
  );
});
