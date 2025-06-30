import { useState, useCallback } from 'react';
import { useBrowserTabs } from '@/hooks/useBrowserTabs';
import TabCard from '@/components/ui/TabCard';
import NewTabCard from '@/components/ui/NewTabCard';
import { 
  YStack, 
  XStack
} from 'tamagui';

interface UseTabManagerContainerProps {
  onTabPress: (tabId: string) => void;
  onClose: () => void;
}

export function useTabManagerContainer({ onTabPress, onClose }: UseTabManagerContainerProps) {
  const { tabs, activeTabId, createTab, closeTab } = useBrowserTabs();
  const [activeTabSection, setActiveTabSection] = useState<string>('regular');

  const regularTabs = tabs.filter(tab => !tab.isPrivate);
  const privateTabs = tabs.filter(tab => tab.isPrivate);

  const handleTabPress = useCallback((tabId: string) => {
    onTabPress(tabId);
    onClose();
  }, [onTabPress, onClose]);

  const handleCloseTab = useCallback((tabId: string, event: any) => {
    event.stopPropagation();
    closeTab(tabId);
    
    if (tabs.length === 1) {
      createTab();
      onClose();
    }
  }, [closeTab, createTab, tabs.length, onClose]);

  const handleNewTab = useCallback((isPrivate: boolean = false) => {
    createTab(undefined, isPrivate);
  }, [createTab]);

  const renderTabGrid = useCallback((tabList: typeof tabs, isPrivateSection: boolean = false) => (
    <YStack space="$4">
      <XStack flexWrap="wrap" justifyContent="space-between">
        {tabList.map((tab) => (
          <TabCard
            key={tab.id}
            tab={tab}
            isActive={activeTabId === tab.id}
            onPress={handleTabPress}
            onClose={handleCloseTab}
          />
        ))}

        <NewTabCard
          isPrivate={isPrivateSection}
          onPress={() => handleNewTab(isPrivateSection)}
        />
      </XStack>
    </YStack>
  ), [activeTabId, handleTabPress, handleCloseTab, handleNewTab]);

  return {
    activeTabSection,
    setActiveTabSection,
    regularTabs,
    privateTabs,
    renderTabGrid,
  };
}