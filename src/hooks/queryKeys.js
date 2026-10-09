// Centralized query keys for TanStack Query
export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (filters) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, 'detail'],
  detail: (id) => [...productKeys.details(), id],
};

export const categoryKeys = {
  all: ['categories'],
  lists: () => [...categoryKeys.all, 'list'],
};

export const orderKeys = {
  all: ['orders'],
  lists: () => [...orderKeys.all, 'list'],
  list: (filters) => [...orderKeys.lists(), filters],
  details: () => [...orderKeys.all, 'detail'],
  detail: (id) => [...orderKeys.details(), id],
};

export const customerKeys = {
  all: ['customers'],
  lists: () => [...customerKeys.all, 'list'],
  details: () => [...customerKeys.all, 'detail'],
  detail: (id) => [...customerKeys.details(), id],
};

export const dashboardKeys = {
  all: ['dashboard'],
  stats: () => [...dashboardKeys.all, 'stats'],
};
