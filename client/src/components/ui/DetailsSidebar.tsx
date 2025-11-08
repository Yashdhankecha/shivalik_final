import { Drawer, Avatar, Text, Group, Badge, Divider, Stack, Button, ActionIcon, ScrollArea } from '@mantine/core';
import { IconX, IconEdit, IconTrash, IconCheck } from '@tabler/icons-react';

interface DetailsSidebarProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  avatar?: string | any;
  status?: 'active' | 'inactive' | 'Verified' | 'Unverified' | 'ACTIVE';
  details: Array<{ label: string; value: string | React.ReactNode, isRedirect?: boolean }>;
  actions?: React.ReactNode;
}

export const DetailsSidebar = ({ opened, onClose, title, subtitle, avatar, status, details, actions, }: DetailsSidebarProps) => {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title=""
      position="right"
      size="400px"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      style={{ overflow: 'hidden' }} // Disable Drawer's default scrolling
    >
      <ScrollArea style={{ height: '100%' }}>
        <Group mb="lg">
          {avatar && <Avatar src={avatar} size={60} radius="xl" />}
          <div style={{ flex: 1 }}>
            <Text fw={500} size="lg">
              {title}
            </Text>
            {subtitle && (
              <Text size="sm" c="dimmed">
                {subtitle}
              </Text>
            )}
            {status && (
              <Badge color={status === 'active' || status === 'Verified' || status === 'ACTIVE' ? 'green' : 'red'} variant="light" size="sm" mt={4}>
                {(status === 'Verified' || status === 'Unverified') ? (
                  status === 'Verified' ? <IconCheck size={14} /> : <IconX size={14} />
                ) : (
                  status === 'active' || status === 'ACTIVE' ? 'active' : 'inactive'
                )}
              </Badge>
            )}
          </div>
        </Group>

        <Divider mb="md" />

        <Stack gap="md">
          {details.map((detail, index) => (
            <Group key={index} justify="space-between" align="flex-start">
              <Text size="sm" c="dimmed" style={{ minWidth: '100px' }}>
                {detail.label}:
              </Text>
              <div style={{ flex: 1, textAlign: 'right' }}>
                {typeof detail.value === 'string' ? (
                  detail?.isRedirect ?
                    <a href={detail.value} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-600 underline">
                      View on Map
                    </a> :
                    <Text size="sm" fw={500}>
                      {detail.value}
                    </Text>
                ) : (
                  detail.value
                )}
              </div>
            </Group>
          ))}
        </Stack>

        {actions && (
          <>
            <Divider my="lg" />
            <Group justify="center">
              {actions}
            </Group>
          </>
        )}
      </ScrollArea>
    </Drawer>
  );
};

export default DetailsSidebar;