import { Card, Avatar, Text, Group, Badge, ActionIcon, Tooltip } from '@mantine/core';
import { IconEye, IconCheck, IconX, IconFingerprint, IconMapPin, IconMap2, IconUser, IconCalendar, IconChartArea } from '@tabler/icons-react';
import { ReactNode } from 'react';

interface EntityCardProps {
  title: string;
  subtitle: string;
  avatar?: string | any;
  status?: 'active' | 'inactive' | 'Verified' | 'Unverified';
  metadata: Array<{ label: string; value: string | React.ReactNode }>;
  onClick: () => void;
  iconMap?: { [key: string]: React.ReactNode };
}

export const EntityCard = ({ title, subtitle, avatar, status, metadata, onClick, iconMap }: EntityCardProps) => {
  const defaultIconMap = {
    referCode: <IconFingerprint color="gray" size={16} />,
    Location: <IconMapPin color="gray" size={16} />,
    Territory: <IconMap2 color="gray" size={16} />,
    City: <IconMapPin color="gray" size={16} />, // Reused for city
    Head: <IconUser color="gray" size={16} />,
    Created: <IconCalendar color="gray" size={16} />,
    Area: <IconChartArea color="gray" size={16} />,
  };

  const getIconForLabel = (label: string) => {
    return iconMap?.[label] || defaultIconMap[label] || <Text size="xs" c="dimmed">{label}:</Text>;
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ cursor: 'pointer' }} onClick={onClick}>
      <Group justify="space-between" mb="md">
        <Group>
          {avatar && <Avatar src={avatar} size={40} radius="xl" />}
          <div>
            <Text fw={500} size="sm">
              {title}
            </Text>
            <Text size="xs" c="dimmed">
              {subtitle}
            </Text>
          </div>
        </Group>
        <Group gap="xs">
          {status && (
            <Badge color={status === 'active' || status === 'Verified' ? 'green' : 'red'} variant="light" size="sm">
              {(status === 'Verified' || status === 'Unverified') ? (
                status === 'Verified' ? <IconCheck size={14} /> : <IconX size={14} />
              ) : (
                status === 'active' ? 'active' : 'inactive'
              )}
            </Badge>
          )}
          <Tooltip label="View Details">
            <ActionIcon variant="light" size="sm">
              <IconEye size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <div>
        {metadata?.map((item, index) => (
          <Group key={index} mb={4}>
            {getIconForLabel(item.label)}
            <Text size="xs" fw={500}>
              {item.value}
            </Text>
          </Group>
        ))}
      </div>
    </Card>
  );
};

export default EntityCard;