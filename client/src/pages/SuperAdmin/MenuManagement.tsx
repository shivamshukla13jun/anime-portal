import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/axiosInterceptor";
import { Role, Roles } from "@/types";
import {
  IRolePermission,
  IResourcePermission,
  IActionPermission,
} from "@/types";

// ───────────────────────────────
// Component
// ───────────────────────────────
const MenuManagement: React.FC = () => {
  const qc = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<Role>("admin");

  // ─────── Fetch Role Permissions ───────
  const {
    data: rolePermission,
    isLoading,
    isError,
  } = useQuery<IRolePermission>({
    queryKey: ["role-permissions", selectedRole],
    queryFn: async () => {
      const { data } = await api.get(`/role-permissions/${selectedRole}`);
      return data?.data;
    },
    enabled: !!selectedRole,
  });

  // ─────── Toggle Access Mutation ───────
  const toggleMutation = useMutation({
    mutationFn: async ({
      resource,
      method,
      title,
      access,
    }: {
      resource: string;
      method: string;
      title: string;
      access: boolean;
    }) => {
      const url = `/role-permissions/${selectedRole}`;
      await api.put(url, { access , resource, method, title});
    },
    onSuccess: () => qc.invalidateQueries({queryKey: ["role-permissions", selectedRole]}),
  });

  const handleToggle = (
    resource: string,
    method: string,
    title: string,
    currentAccess: boolean
  ) => {
    toggleMutation.mutate({
      resource,
      method,
      title,
      access: !currentAccess,
    });
  };

  // ─────── UI States ───────
  if (isLoading)
    return (
      <Box textAlign="center" mt={6}>
        <CircularProgress />
        <Typography variant="body2" mt={2}>
          Loading role permissions...
        </Typography>
      </Box>
    );

  if (isError || !rolePermission)
    return (
      <Alert severity="error" sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
        Failed to load permissions for role: {selectedRole}
      </Alert>
    );

  // ─────── Main UI ───────
  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
      <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Role Permission Management
          </Typography>

          {/* Role Selector */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Select Role
            </Typography>
            <Select
              size="small"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              sx={{ minWidth: 200 }}
            >
              {Roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Permission List */}
          {rolePermission.resources.length === 0 ? (
            <Alert severity="info">No permissions found for this role.</Alert>
          ) : (
            rolePermission.resources.map(
              (res: IResourcePermission, resIdx: number) => (
                <Card
                  key={resIdx}
                  variant="outlined"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    borderColor: "divider",
                    bgcolor: "grey.50",
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6" fontWeight={600}>
                        {res.resource}
                      </Typography>
                      <Chip
                        label={`${res.source.length} actions`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    <Grid container spacing={1}>
                      {res.source.map(
                        (action: IActionPermission, idx: number) => (
                          <Grid item xs={12} sm={6} md={3} key={idx}>
                            <FormControlLabel
                              control={
                                <Switch
                                  size="small"
                                  color="success"
                                  checked={action.access}
                                  disabled={toggleMutation.isPending}
                                  onChange={() =>
                                    handleToggle(
                                      res.resource,
                                      action.method,
                                      action.title,
                                      action.access
                                    )
                                  }
                                />
                              }
                              label={
                                <Typography
                                  variant="body2"
                                  sx={{ textTransform: "capitalize" }}
                                >
                                  {action.title} ({action.method})
                                </Typography>
                              }
                            />
                          </Grid>
                        )
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              )
            )
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MenuManagement;
