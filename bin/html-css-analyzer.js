#!/usr/bin/env node

const [,, command] = process.argv;

const commands = {
  'find-unused': require('../lib/find-unused'),
  'remove-empty': require('../lib/remove-empty'),
  'remove-unused': require('../lib/remove-unused'),
};

if (command in commands) {
  commands[command]();
} else {
  console.error('Неизвестная команда. Доступные команды: find-unused, remove-empty, remove-unused');
  process.exit(1);
}
