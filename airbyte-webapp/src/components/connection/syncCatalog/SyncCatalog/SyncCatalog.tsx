import classNames from "classnames";
import React, { useCallback, useMemo, useState } from "react";
import { useToggle } from "react-use";

import { LoadingBackdrop } from "components/ui/LoadingBackdrop";

import { SyncSchemaStream } from "core/domain/catalog";
import { BulkEditServiceProvider } from "hooks/services/BulkEdit/BulkEditService";
import { useConnectionFormService } from "hooks/services/ConnectionForm/ConnectionFormService";
import { naturalComparatorBy } from "utils/objects";

import { DisabledStreamsSwitch } from "./DisabledStreamsSwitch";
import styles from "./SyncCatalog.module.scss";
import { SyncCatalogBody } from "./SyncCatalogBody";
import { SyncCatalogStreamSearch } from "./SyncCatalogStreamSearch";
import { useStreamFilters } from "./useStreamFilters";
import { BulkEditPanel } from "../BulkEditPanel";

interface SyncCatalogProps {
  streams: SyncSchemaStream[];
  onStreamsChanged: (streams: SyncSchemaStream[]) => void;
  isLoading: boolean;
}

const SyncCatalogInternal: React.FC<React.PropsWithChildren<SyncCatalogProps>> = ({
  streams,
  onStreamsChanged,
  isLoading,
}) => {
  const { initialValues, mode } = useConnectionFormService();

  const [searchString, setSearchString] = useState("");
  const [hideDisabledStreams, toggleHideDisabledStreams] = useToggle(false);

  const onBatchStreamsChanged = useCallback(
    (newStreams: SyncSchemaStream[]) =>
      onStreamsChanged(streams.map((str) => newStreams.find((newStr) => newStr.id === str.id) ?? str)),
    [streams, onStreamsChanged]
  );

  const onSingleStreamChanged = useCallback(
    (newValue: SyncSchemaStream) => onStreamsChanged(streams.map((str) => (str.id === newValue.id ? newValue : str))),
    [streams, onStreamsChanged]
  );

  const sortedSchema = useMemo(
    () => [...streams].sort(naturalComparatorBy((syncStream) => syncStream.stream?.name ?? "")),
    [streams]
  );

  const changedStateStreams = useMemo(
    () =>
      streams.filter((stream) => {
        const matchingInitialValue = initialValues.syncCatalog.streams.find((initialStream) => {
          if (!stream.stream || !initialStream.stream) {
            return false;
          }

          return (
            initialStream.stream.name === stream.stream.name &&
            initialStream.stream.namespace === stream.stream.namespace
          );
        });
        return stream.config?.selected !== matchingInitialValue?.config?.selected;
      }),
    [initialValues.syncCatalog.streams, streams]
  );

  const filteredStreams = useStreamFilters(searchString, hideDisabledStreams, sortedSchema);

  return (
    <BulkEditServiceProvider nodes={filteredStreams} update={onBatchStreamsChanged}>
      <LoadingBackdrop loading={isLoading}>
        <SyncCatalogStreamSearch onSearch={setSearchString} />
        <DisabledStreamsSwitch checked={hideDisabledStreams} onChange={toggleHideDisabledStreams} />
        <div
          className={classNames(styles.bodyContainer, {
            [styles.scrollable]: mode === "create",
          })}
        >
          <SyncCatalogBody
            streams={filteredStreams}
            changedStreams={changedStateStreams}
            onStreamChanged={onSingleStreamChanged}
            isFilterApplied={filteredStreams.length !== streams.length}
          />
        </div>
      </LoadingBackdrop>
      <BulkEditPanel />
    </BulkEditServiceProvider>
  );
};

export const SyncCatalog = React.memo(SyncCatalogInternal);
