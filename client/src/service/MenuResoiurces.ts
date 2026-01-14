import api from '@/utils/axiosInterceptor';

export interface MenuItem {
	path: string;
	methods: string[];
	title?: string;
}

export interface RoleMapping {
	[role: string]: MenuItem[];
}

export async function fetchRoleMappings(): Promise<RoleMapping> {
	const res = await api.get('/role-permissions');
	return res.data;
}

export async function addRoleMappingEntry(role: string, entry: MenuItem) {
	const res = await api.post(`/role-permissions/${role}`, entry);
	return res.data;
}

export async function replaceRoleMapping(role: string, entries: MenuItem[]) {
	const res = await api.put(`/role-permissions/${role}`, entries);
	return res.data;
}

export async function removeRoleMappingEntry(role: string, path: string) {
	const res = await api.delete(`/role-permissions/${role}`, { params: { path } });
	return res.data;
}

export function mappingToMenuItems(mapping: RoleMapping, role: string) {
	const items = mapping[role] || [];
	// Convert to UI menu format (group by title then paths)
	const grouped: Record<string, MenuItem[]> = {};
	items.forEach((it) => {
		const title = it.title || it.path.split('/').filter(Boolean)[1] || it.path;
		grouped[title] = grouped[title] || [];
		grouped[title].push(it);
	});
	return Object.entries(grouped).map(([title, children]) => ({ title, children }));
}

export default { fetchRoleMappings, addRoleMappingEntry, replaceRoleMapping, removeRoleMappingEntry, mappingToMenuItems };

